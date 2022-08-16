import { group, object } from "../alias.mjs";
import { Atom } from "../data.mjs";

import vs from "../../shaders/lines.vert";
import fs from "../../shaders/lines.frag";

export let atomDirtyUniforms = new Atom({});

export let compContainer = (store: any) => {
  return group({}, compAxis());
};

let compAxis = () => {
  return object({
    vertexShader: vs,
    fragmentShader: fs,
    drawMode: "lines",
    points: [
      [-400, 0, 0],
      [400, 0, 0],
      [0, 400, 0],
      [0, -400, 0],
      [0, 0, -400],
      [0, 0, 400],
    ],
  });
};
