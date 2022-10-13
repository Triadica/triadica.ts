import * as twgl from "twgl.js";

import { backConeScale, cachedBuildProgram, dpr, isMobile, isPostEffect } from "./config.mjs";
import { Atom } from "./atom.mjs";
import { atomGlContext, atomMouseHoldingPaths, atomObjectsBuffer, atomObjectsTree, atomProxiedDispatch } from "./global.mjs";
import { atomViewerPosition, atomViewerUpward, moveViewerBy, newLookatPoint, rotateGlanceBy, spinGlanceBy, transform3d } from "./perspective.mjs";
import { ControlStates } from "@triadica/touch-control";
import { cDistance } from "./math.mjs";
import { V2, TriadicaElement, TriadicaObjectData } from "./primes.mjs";

import effectXVert from "../shaders/effect-x.vert";
import effectXFrag from "../shaders/effect-x.frag";
import effectMixVert from "../shaders/effect-mix.vert";
import effectMixFrag from "../shaders/effect-mix.frag";
import { vCross, vNomalize, vLength } from "./quaternion.mjs";

export let resetCanvasSize = (canvas: HTMLCanvasElement) => {
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
};

export let loadObjects = (tree: TriadicaElement, dispatch: (op: string, data: any) => void) => {
  let gl = atomGlContext.deref();
  atomObjectsTree.reset(tree);
  atomObjectsBuffer.reset([]);
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
  let lookat = newLookatPoint();
  let lookDistance = vLength(lookat);
  let forward = vNomalize(lookat);
  let rightward = vCross(forward, atomViewerUpward.deref());
  let uniforms = {
    lookDistance,
    upward: atomViewerUpward.deref(),
    forward,
    cameraPosition: atomViewerPosition.deref(),
    rightward,
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
    let programInfo = object.program;
    let bufferInfo = object.buffer;
    let currentUniforms = uniforms;
    if (object.getUniforms) {
      currentUniforms = object.getUniforms() as any;
      Object.assign(currentUniforms, uniforms);
    }
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    // console.log("currentUniforms", currentUniforms);
    twgl.setUniforms(programInfo, currentUniforms);
    switch (object.drawMode) {
      case "triangles":
        twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES);
        break;
      case "triangle-fan":
        twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_FAN);
        break;
      case "triangle-strip":
        twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP);
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
    let effectXProgram = cachedBuildProgram(gl, effectXVert, effectXFrag);
    let mixProgram = cachedBuildProgram(gl, effectMixVert, effectMixFrag);

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

    blurAtDirection(gl, drawFb, effectXFb, 1, effectXProgram, effectXBufferInfo);
    blurAtDirection(gl, effectXFb, effectYFb, 0, effectXProgram, effectXBufferInfo);
    blurAtDirection(gl, effectYFb, effectXFb, 1, effectXProgram, effectXBufferInfo);
    blurAtDirection(gl, effectXFb, effectYFb, 0, effectXProgram, effectXBufferInfo);
    blurAtDirection(gl, effectYFb, effectXFb, 1, effectXProgram, effectXBufferInfo);
    blurAtDirection(gl, effectXFb, effectYFb, 0, effectXProgram, effectXBufferInfo);
    twgl.bindFramebufferInfo(gl, null);
    twgl.resizeCanvasToDisplaySize(gl.canvas, dpr);
    clearGl(gl);
    gl.useProgram(mixProgram.program);
    twgl.setBuffersAndAttributes(gl, mixProgram, mixBufferInfo);
    twgl.setUniforms(mixProgram, {
      draw_tex: drawFb.attachments[0],
      effect_x_tex: effectYFb.attachments[0],
    });
    twgl.drawBufferInfo(gl, mixBufferInfo, gl.TRIANGLES);
  }
};

export let setupMouseEvents = (canvas: HTMLCanvasElement) => {
  canvas.onclick = handleScreenClick;
  canvas.onpointerdown = handleScreenMousedown;
  canvas.onpointermove = handleScreenMousemove;
  canvas.onpointerup = handleScreenMouseup;
  canvas.onpointerleave = handleScreenMouseup;
};

export let traverseTree = (tree: TriadicaElement, coord: number[], cb: (obj: TriadicaObjectData, coord: number[]) => void) => {
  if (tree != null) {
    switch (tree.type) {
      case "object":
        cb(tree, coord);
        break;
      case "group":
        if (tree.children != null) {
          tree.children.map((child: TriadicaElement, idx: number) => {
            traverseTree(child, [...coord, idx], cb);
          });
        }
        break;
      default:
        console.warn(`unknown element type: ${tree}`);
        break;
    }
  }
};

let createAttributeArray = (points: number[] | number[][]): ArrayBufferView => {
  let p0 = points[0];
  if (Array.isArray(p0)) {
    let pps = points.flat();
    let num = p0.length;
    let positionArray = twgl.primitives.createAugmentedTypedArray(num, points.length, null);
    for (let idx = 0; idx < pps.length; idx++) {
      (positionArray as any)[idx] = pps[idx];
    }

    return positionArray;
  }
  if (typeof p0 === "number") {
    let positionArray = twgl.primitives.createAugmentedTypedArray(1, points.length, null);
    for (let idx = 0; idx < points.length; idx++) {
      (positionArray as any)[idx] = points[idx];
    }

    return positionArray;
  }
  console.error("unknown attributes data:", points);
  return twgl.primitives.createAugmentedTypedArray(1, points.length, null);
};

let blurAtDirection = (
  gl: WebGLRenderingContext,
  fromFb: twgl.FramebufferInfo,
  toFb: twgl.FramebufferInfo,
  direction: number,
  program: twgl.ProgramInfo,
  buffer: twgl.BufferInfo
) => {
  twgl.resizeFramebufferInfo(gl, toFb);
  twgl.resizeCanvasToDisplaySize(gl.canvas, dpr);
  twgl.bindFramebufferInfo(gl, toFb);
  clearGl(gl);
  gl.useProgram(program.program);
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
  fbRef: Atom<{
    buffer: twgl.FramebufferInfo;
    size: V2;
  }>,
  w: number,
  h: number
): twgl.FramebufferInfo => {
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

export let onControlEvent = (elapsed: number, states: ControlStates, delta: ControlStates) => {
  let lMove = states.leftMove.map(refineStrength) as V2;
  let rMove = states.rightMove.map(refineStrength) as V2;
  let rDelta = delta.rightMove;
  let lDelta = delta.leftMove;
  let leftA = states.leftA;
  let rightA = states.rightA || states.shift;
  let rightB = states.rightB;
  let leftB = states.leftB;
  if (lMove[1] !== 0) {
    moveViewerBy(0, 0, -2 * elapsed * lMove[1]);
  }
  if (lMove[0] !== 0) {
    rotateGlanceBy(-0.05 * elapsed * lMove[0], 0);
  }
  if (!rightA && !isZero(rMove)) {
    moveViewerBy(2 * elapsed * rMove[0], 2 * elapsed * rMove[1], 0);
  }
  if (rightA && rMove[1] !== 0) {
    rotateGlanceBy(0, 0.05 * elapsed * rMove[1]);
  }
  if (rightA && rMove[0] !== 0) {
    spinGlanceBy(-0.05 * elapsed * rMove[0]);
  }
  if (!isZero(lMove) || !isZero(rMove)) {
    paintCanvas();
  }
};

let isZero = (v: V2): boolean => {
  return v[0] === 0 && v[1] === 0;
};

let refineStrength = (x: number): number => {
  return x * Math.sqrt(Math.abs(x * 0.02));
};

let handleScreenClick = (event: MouseEvent) => {
  let x = event.clientX - window.innerWidth * 0.5;
  let y = -(event.clientY - window.innerHeight * 0.5);
  let scaleRadio = 0.002 * 0.5 * window.innerWidth;
  let touchDeviation = isMobile ? 16 : 4;
  let hitTargetsBuffer = new Atom([]);
  traverseTree(atomObjectsTree.deref(), [], (obj: TriadicaObjectData, coord: number[]) => {
    if (obj.hitRegion != null) {
      let region = obj.hitRegion;
      if (region.onHit != null) {
        let onHit = region.onHit;
        let mappedPosition = transform3d(region.position);
        let screenPosition = mappedPosition.map((p: number) => {
          return p * scaleRadio;
        });
        let r = mappedPosition[2];
        let mappedRadius = scaleRadio * region.radius * ((backConeScale + 1) / (r + backConeScale));
        let distance = cDistance([screenPosition[0], screenPosition[1]], [x, y]);
        if (distance <= touchDeviation + mappedRadius && r > -0.8 * backConeScale) {
          hitTargetsBuffer.deref().push([r, onHit, null]);
        }
      }
    }
  });
  if (hitTargetsBuffer.deref().length > 0) {
    let nearest = findNearest(null, null, null, hitTargetsBuffer.deref());
    let onHit = nearest[0];
    onHit(event, atomProxiedDispatch.deref());
  }
};

let handleScreenMousedown = (event: MouseEvent) => {
  let x = event.clientX - 0.5 * window.innerWidth;
  let y = -(event.clientY - 0.5 * window.innerHeight);
  let scaleRadio = 0.002 * 0.5 * window.innerWidth;
  let touchDeviation = isMobile ? 16 : 4;
  let hitTargetsBuffer = new Atom([]);
  traverseTree(atomObjectsTree.deref(), [], (obj: TriadicaObjectData, coord: number[]) => {
    if (obj.hitRegion != null) {
      let region = obj.hitRegion;
      if (region.onMousedown != null) {
        let onMousedown = region.onMousedown;
        let mappedPosition = transform3d(region.position);
        let screenPosition = mappedPosition.map((p: number) => {
          return p * scaleRadio;
        });
        let r = mappedPosition[2];
        let mappedRadius = scaleRadio * region.radius * ((backConeScale + 1) / (r + backConeScale));
        let distance = cDistance([screenPosition[0], screenPosition[1]], [x, y]);
        if (distance <= touchDeviation + mappedRadius && r > -0.8 * backConeScale) {
          hitTargetsBuffer.deref().push([r, onMousedown, coord]);
        }
      }
    }
  });
  if (hitTargetsBuffer.deref().length > 0) {
    let nearest = findNearest(null, null, null, hitTargetsBuffer.deref());
    let onMousedown = nearest[0];
    let coord = nearest[1];
    onMousedown(event, atomProxiedDispatch.deref());
    atomMouseHoldingPaths.deref().push(coord);
  }
};

let handleScreenMousemove = (event: MouseEvent) => {
  let paths = atomMouseHoldingPaths.deref();
  if (paths.length > 0) {
    for (let p of paths) {
      let node = loadTreeNode(atomObjectsTree.deref(), p);
      if (node.type === "object") {
        let onMove = node.hitRegion?.onMousemove;
        if (onMove != null) {
          onMove(event, atomProxiedDispatch.deref());
        }
      }
    }
  }
};

let handleScreenMouseup = (event: MouseEvent) => {
  let paths = atomMouseHoldingPaths.deref();
  if (paths.length > 0) {
    for (let p of paths) {
      let node = loadTreeNode(atomObjectsTree.deref(), p);
      if (node.type === "object") {
        let onUp = node.hitRegion?.onMouseup;
        if (onUp != null) {
          onUp(event, atomProxiedDispatch.deref());
        }
      }
    }
    atomMouseHoldingPaths.reset([]);
  }
};

let findNearest = (
  r: number,
  prev: (event: MouseEvent, d: any) => void,
  coord: number[],
  xs: [number, (event: MouseEvent, d: any) => void, number[]][]
): [(event: MouseEvent, d: any) => void, number[]] => {
  if (xs.length === 0) {
    if (prev != null) {
      return [prev, coord];
    } else {
      return null;
    }
  }
  let x0 = xs[0];
  let r0 = x0[0];
  let t0 = x0[1];
  let c0 = x0[2];
  if (prev == null) {
    return findNearest(r0, t0, c0, xs.slice(1));
  } else {
    if (r0 < r) {
      return findNearest(r0, t0, c0, xs.slice(1));
    } else {
      return findNearest(r, prev, coord, xs.slice(1));
    }
  }
};

let loadTreeNode = (tree: TriadicaElement, path: number[]): TriadicaElement => {
  if (path.length === 0) {
    return tree;
  } else if (tree.type === "group") {
    let children = tree.children;
    return loadTreeNode(children[path[0]], path.slice(1));
  } else {
    console.error("loadTreeNode: invalid tree", tree);
    throw new Error("Unexpected tree node");
  }
};
