import { TriadicaElement, V3 } from "../primes.mjs";
import { object } from "../alias.mjs";
import { compTube } from "./tube.mjs";
import { range } from "../math.mjs";
import { vAdd, vScale } from "../quaternion.mjs";

import vs from "../../shaders/axis.vert";
import fs from "../../shaders/axis.frag";

export let compAxis = (o?: { radius?: number; segments?: number; length?: number }): TriadicaElement => {
  let options = o || {};
  let radius = options.radius || 2;
  let segments = options.segments || 10;
  let length = options.length || 400;
  let negLength = -length;
  return compTube({
    // drawMode: "line-strip",
    circleStep: 6,
    normal0: [1, 1, 1],
    vertexShader: vs,
    fragmentShader: fs,
    radius: radius,
    curve: [
      interpolateLinePositions([negLength, 0, 0], [length, 0, 0], segments),
      interpolateLinePositions([0, negLength, 0], [0, length, 0], segments),
      interpolateLinePositions([0, 0, negLength], [0, 0, length], segments),
    ],
  });
};

let interpolateLinePositions = (a: V3, b: V3, n: number): { position: V3 }[] => {
  let ratio = 1 / n;
  return range(n + 1).map((idx) => {
    return {
      position: vAdd(vScale(a, ratio * idx), vScale(b, ratio * (n - idx))),
    };
  });
};
