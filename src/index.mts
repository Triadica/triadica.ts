import {
  backConeScale,
  cachedBuildProgram,
  dpr,
  isPostEffect,
} from "./config.mjs";
import { Atom } from "./data.mjs";
import {
  atomGlContext,
  atomObjectsBuffer,
  atomObjectsTree,
  atomProxiedDispatch,
} from "./global.mjs";
import {
  atomViewerPosition,
  atomViewerUpward,
  newLookatPoint,
} from "./perspective.mjs";
import * as twgl from "twgl.js";

export let resetCanvasSize = (canvas: HTMLCanvasElement) => {
  canvas.style.width = `${window.innerWidth}`;
  canvas.style.height = `${window.innerHeight}`;
};

export let loadObjects = (
  tree: any,
  dispatch: (op: string, data: any) => void
) => {
  let gl = atomGlContext.deref();
  atomObjectsTree.reset(tree);
  atomProxiedDispatch.reset(dispatch);
  traverseTree(tree, [], (obj, coord) => {
    let program = cachedBuildProgram(gl, obj.vertexShader, obj.fragmentShader);
    let buffer = twgl.createBufferInfoFromArrays(gl, obj.arrays);
    atomObjectsBuffer.deref().push({
      program,
      buffer,
      drawMode: obj.drawMode,
      getUniforms: obj.getUniforms,
    });
  });
};

let atomDrawFb = new Atom(null);
let atomEffectXFb = new Atom(null);
let atomEffectYFb = new Atom(null);

export let paintCanvas = () => {
  let gl = atomGlContext.deref();
  let scaledWidth = dpr * window.innerWidth;
  let scaledHeight = dpr * window.innerHeight;
  let uniforms = {
    lookPoint: newLookatPoint(),
    upwardDirection: atomViewerUpward.deref(),
    cameraPosition: atomViewerPosition.deref(),
    coneBackScale: backConeScale,
    viewportRatio: window.innerHeight / window.innerWidth,
  };
  let drawFb = loadSizedBuffer(gl, atomDrawFb, scaledWidth, scaledHeight);
  let effectXFb = loadSizedBuffer(gl, atomEffectXFb, scaledWidth, scaledHeight);
  let effectYFb = loadSizedBuffer(gl, atomEffectYFb, scaledWidth, scaledHeight);
  twgl.resizeCanvasToDisplaySize(gl.canvas, dpr);
  if (isPostEffect) {
    twgl.resizeFramebufferInfo(gl, drawFb);
    twgl.bindFramebufferInfo(gl, drawFb);
  } else {
    twgl.bindFramebufferInfo(gl, null);
  }
  gl.viewport(0, 0, scaledWidth, scaledHeight);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.depthMask(true);
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  // gl.enable(gl.BLEND);
  // gl.enable(gl.CULL_FACE);
  // gl.cullFace(gl.BACK);
  // gl.cullFace(gl.FRONT_AND_BACK);
  clearGl(gl);
  let objects = atomObjectsBuffer.deref();
  for (let object of objects) {
    console.log("rendering object", object);
    let programInfo = object.program;
    let bufferInfo = object.buffer;
    let currentUniforms = uniforms;
    if (object.getUniforms) {
      currentUniforms = object.getUniforms();
      Object.assign(currentUniforms, uniforms);
    }
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    console.log("currentUniforms", currentUniforms);
    twgl.setUniforms(programInfo, currentUniforms);
    switch (object.drawMode) {
      case "triangles":
        console.info("triangles");
        twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES);
        break;
      case "lines":
        twgl.drawBufferInfo(gl, bufferInfo, gl.LINES);
        break;
      case "line-strip":
        twgl.drawBufferInfo(gl, bufferInfo, gl.LINE_STRIP);
        break;
      case "line-loop":
        twgl.drawBufferInfo(gl, bufferInfo, gl.LINE_LOOP);
        break;
      default:
        console.warn(`unknown draw mode: ${object.drawMode}`);
        twgl.drawBufferInfo(gl, bufferInfo, gl.LINES);
        break;
    }
  }
  if (isPostEffect) {
    console.error("TODO");
    let effectXPrograme = cachedBuildProgram(gl, "TODO", "TODO");
    let mixProgram = cachedBuildProgram(gl, "TODO", "TODO");
    let uvSettings = {
      position: createAttributeArray([
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, -1],
        [-1, 1],
        [1, 1],
      ]),
    };
    let effectXBufferInfo = twgl.createBufferInfoFromArrays(gl, uvSettings);

    let mixBufferInfo = twgl.createBufferInfoFromArrays(gl, uvSettings);
    gl.disable(gl.DEPTH_TEST);
    blurAtDirection(
      gl,
      drawFb,
      effectXFb,
      1,
      effectXPrograme,
      effectXBufferInfo
    );
    blurAtDirection(
      gl,
      effectXFb,
      effectYFb,
      0,
      effectXPrograme,
      effectXBufferInfo
    );
    blurAtDirection(
      gl,
      effectYFb,
      effectXFb,
      1,
      effectXPrograme,
      effectXBufferInfo
    );
    blurAtDirection(
      gl,
      effectXFb,
      effectYFb,
      0,
      effectXPrograme,
      effectXBufferInfo
    );
    blurAtDirection(
      gl,
      effectYFb,
      effectXFb,
      1,
      effectXPrograme,
      effectXBufferInfo
    );
    blurAtDirection(
      gl,
      effectXFb,
      effectYFb,
      0,
      effectXPrograme,
      effectXBufferInfo
    );
    twgl.bindFramebufferInfo(gl, null);
    twgl.resizeCanvasToDisplaySize(gl.canvas, dpr);
    clearGl(gl);
    gl.useProgram(mixProgram);
    twgl.setBuffersAndAttributes(gl, mixProgram, mixBufferInfo);
    twgl.setUniforms(mixProgram, {
      draw_tex: drawFb.attachments[0],
      effect_x_tex: effectXFb.attachments[0],
    });
    twgl.drawBufferInfo(gl, mixBufferInfo, gl.TRIANGLES);
  }
};

export let setupMouseEvents = (canvas: HTMLCanvasElement) => {
  // TODO
};

export let traverseTree = (
  tree: any,
  coord: number[],
  cb: (obj: any, coord: any) => void
) => {
  if (tree != null) {
    switch (tree.type) {
      case "object":
        cb(tree, coord);
        break;
      case "group":
        if (tree.children != null) {
          tree.children.map((child: any, idx: number) => {
            traverseTree(child, [...coord, idx], cb);
          });
        }
        break;
      default:
        console.warn(`unknown element type: ${tree.type}`);
        break;
    }
  }
};

let createAttributeArray = (points: any[]) => {
  let p0 = points[0];
  if (Array.isArray(p0)) {
    let pps = points.flat();
    let num = p0.length;
    let positionArray = twgl.primitives.createAugmentedTypedArray(
      num,
      points.length,
      null
    );
    for (let idx = 0; idx < points.length; idx++) {
      (positionArray as any)[idx] = points[idx];
    }

    return positionArray;
  }
  if (typeof p0 === "number") {
    let positionArray = twgl.primitives.createAugmentedTypedArray(
      1,
      points.length,
      null
    );
    for (let idx = 0; idx < points.length; idx++) {
      (positionArray as any)[idx] = points[idx];
    }

    return positionArray;
  }
  console.error('"unknown attributes data:' + points);
  return twgl.primitives.createAugmentedTypedArray(1, points.length, null);
};

let blurAtDirection = (
  gl: WebGLRenderingContext,
  fromFb: twgl.FramebufferInfo,
  toFb: twgl.FramebufferInfo,
  direction: number,
  program: any,
  buffer: any
) => {
  twgl.resizeFramebufferInfo(gl, toFb);
  twgl.resizeCanvasToDisplaySize(gl.canvas, dpr);
  twgl.bindFramebufferInfo(gl, toFb);
  // clearGl(gl);
  gl.useProgram(program);
  twgl.setBuffersAndAttributes(gl, program, buffer);
  twgl.setUniforms(program, {
    tex1: fromFb.attachments[0],
    direction: direction,
  });
  twgl.drawBufferInfo(gl, buffer, gl.TRIANGLES);
};

let clearGl = (gl: WebGLRenderingContext) => {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

let loadSizedBuffer = (
  gl: WebGLRenderingContext,
  fbRef: Atom<any>,
  w: number,
  h: number
) => {
  let b = fbRef.deref();
  if (b && b.size && b.size[0] === w && b.size[1] === h) {
    return b.buffer;
  }
  let f = twgl.createFramebufferInfo(gl);
  fbRef.reset({
    buffer: f,
    size: [w, h],
  });
  return f;
};
