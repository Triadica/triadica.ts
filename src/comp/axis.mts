import { TriadicaObjectData } from "../primes.mjs";
import { object } from "../alias.mjs";

import vs from "../../shaders/lines.vert";
import fs from "../../shaders/lines.frag";

export let compAxis = (): TriadicaObjectData => {
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
