import { cachedBuildProgram } from "config.mjs";
import {
  atomGlContext,
  atomObjectsBuffer,
  atomObjectsTree,
  atomProxiedDispatch,
} from "global.mjs";
import twgl from "twgl.js";

export let resetCanvasSize = (canvas: HTMLCanvasElement) => {
  canvas.style.width = `${window.innerWidth}`;
  canvas.style.height = `${window.innerHeight}`;
};

export let loadObjects = (
  tree: any[],
  dispatch: (op: string, data: any) => void
) => {
  let gl = atomGlContext.deref();
  atomObjectsTree.reset(tree);
  atomProxiedDispatch.reset(dispatch);
  traverseTree(tree, [], (obj, coord) => {
    let program = cachedBuildProgram(gl, obj.fragmentShader, obj.vertexShader);
    let buffer = twgl.createBufferInfoFromArrays(gl, obj.arrays);
    atomObjectsBuffer.deref().push({
      program,
      buffer,
      drawMode: obj.drawMode,
      getUniforms: obj.getUniforms,
    });
  });
};

export let paintCanvas = () => {
  // TODO
};

export let setupMouseEvents = (canvas: HTMLCanvasElement) => {
  // TODO
};

export let traverseTree = (
  tree: any[],
  coord: string[],
  cb: (obj: any, coord: any) => void
) => {
  // TODO
};
