import { Atom } from "data.mjs";
import twgl from "twgl.js";

export let isDev = true; // TODO

let atomShaderPrograms = new Atom<Record<string, WebGLProgram>>({});

export let cachedBuildProgram = (
  gl: WebGL2RenderingContext,
  vs: string,
  fs: string
): WebGLProgram => {
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
