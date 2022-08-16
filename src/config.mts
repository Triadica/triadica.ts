import { Atom } from "./data.mjs";
import * as twgl from "twgl.js";

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

import glslPerspectiveCode from "../shaders/triadica-perspective.glsl";
import glslNoisesCode from "../shaders/triadica-noises.glsl";
import glslRotationCode from "../shaders/triadica-rotation.glsl";

let replaceVertexShader = (vs: string): string => {
  return vs
    .replace("{{triadica_perspective}}", glslPerspectiveCode)
    .replace("{{triadica_noises}}", glslNoisesCode)
    .replace("{{triadica_rotation}}", glslRotationCode);
};

import glslColorsCode from "../shaders/triadica-colors.glsl";

let replaceFragmentShader = (fs: string): string => {
  return fs
    .replace("{{triadica_colors}}", glslColorsCode)
    .replace("{{triadica_noises}}", glslNoisesCode);
};

export let dpr = window.devicePixelRatio;

export let backConeScale = 0.5;

export let halfPi = 0.5 * Math.PI;

export let isPostEffect = false; // TODO

export let isMobile = false; // TODO
