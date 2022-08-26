import { group, object } from "../alias.mjs";

import { FnDispatch, V3, V2 } from "../primes.mjs";

import jadeiteVert from "../../shaders/jadeite.vert";
import jadeiteFrag from "../../shaders/jadeite.frag";

import { range } from "../math.mjs";

export let compJadeite = (store: any) => {
  let n = 300;
  let r = 200;
  let step = 300;
  let origin: V3 = [0, 0, 0];

  return object({
    drawMode: "triangles",
    vertexShader: jadeiteVert,
    fragmentShader: jadeiteFrag,
    packedAttrs: range(n).map((idx) => {
      return range(step).map((d) => {
        let theta = (idx * Math.PI * 2) / n;
        let theta_next = ((idx + 1) * Math.PI * 2) / n;
        let ri = (r * (d * Math.PI * 2)) / step;
        let ri_next = (r * ((d + 1) * Math.PI * 2)) / step;

        let p0 = [ri * Math.cos(theta), 0, ri * Math.sin(theta)];
        let p1 = [ri * Math.cos(theta_next), 0, ri * Math.sin(theta_next)];
        let p2 = [ri_next * Math.cos(theta), 0, ri_next * Math.sin(theta)];
        let p3 = [ri_next * Math.cos(theta_next), 0, ri_next * Math.sin(theta_next)];

        return [{ position: p0 }, { position: p1 }, { position: p2 }, { position: p1 }, { position: p2 }, { position: p3 }];
      });
    }),
  });
};
