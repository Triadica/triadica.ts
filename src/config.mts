import { Atom } from "data.mjs";
import twgl from "twgl.js";

export let isDev = true; // TODO

let atomShaderPrograms = new Atom<Record<string, twgl.ProgramInfo>>({});

export let cachedBuildProgram = (
  gl: WebGLRenderingContext,
  vs: string,
  fs: string
): twgl.ProgramInfo => {
  let caches = atomShaderPrograms.deref();
  let field = `${vs}\n@@@@@@\n${fs}`;
  if (caches[field] != null) {
    return caches[field];
  } else {
    let program = twgl.createProgramInfo(gl, [
      replaceVertexShader(vs),
      replaceFragmentShader(fs),
    ]);
    caches[field] = program;
    return program;
  }
};

let replaceVertexShader = (vs: string): string => {
  // TODO
  return vs;
};

let replaceFragmentShader = (fs: string): string => {
  // TODO
  return fs;
};

export let dpr = window.devicePixelRatio;

export let backConeScale = 0.5;

export let halfPi = 0.5 * Math.PI;

export let isPostEffect = false; // TODO
