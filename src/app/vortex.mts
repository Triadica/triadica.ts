import { TriadicaObjectData } from "../primes.mjs";
import { object } from "../alias.mjs";

import vs from "../../shaders/vortex.vert";
import fs from "../../shaders/vortex.frag";
import { range } from "../math.mjs";

let pageStart = Date.now();

export let compVortex = (): TriadicaObjectData => {
  // -8 to 8
  let layers = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
  let pieces = 400;
  let segments = 200;
  let rTotal = 400;
  let angleTotal = Math.PI * 0.9;

  let dr = rTotal / segments;
  let dAngle = angleTotal / segments;
  let dLayer = (2 * layers.length) / segments;

  return object({
    vertexShader: vs,
    fragmentShader: fs,
    drawMode: "lines",
    getUniforms: () => {
      // console.log(performance.now() * 0.001);
      return {
        // u_time: performance.now() * 0.001,
        u_time: (Date.now() - pageStart) * 0.001, // performance.now is strange on pad
      };
    },
    packedAttrs: layers.map((layerIdx) => {
      return range(pieces).map((pIdx) => {
        let phase = (2 * Math.PI * pIdx) / pieces;
        return range(segments).map((segIdx) => {
          let dAngle2 = dAngle * (1 - 0.1 * Math.abs(layerIdx));
          let dr2 = dr * (1 - 0.08 * Math.abs(layerIdx));
          let r = dr2 * segIdx;
          let angle = dAngle2 * segIdx + phase;

          let rNext = dr2 * (segIdx + 1);
          let angleNext = dAngle2 * (segIdx + 1) + phase;

          return [
            {
              position: [r * Math.cos(angle), r * Math.sin(angle), dLayer * layerIdx * segIdx],
              colorInfo: [pIdx, segIdx],
            },
            {
              position: [rNext * Math.cos(angleNext), rNext * Math.sin(angleNext), dLayer * layerIdx * segIdx],
              colorInfo: [pIdx + 1, segIdx + 1],
            },
          ];
        });
      });
    }),
  });
};
