import { TriadicaElement } from "../primes.mjs";
import { group } from "../alias.mjs";
import { compTube, compBrush } from "../comp/tube.mjs";
import { range } from "../math.mjs";

export let compTubeDemo = (): TriadicaElement => {
  return group(
    {},

    compTube({
      drawMode: "line-loop",
      curve: range(200).map((idx) => {
        let angle = idx * 0.04;
        let r = 200;
        return {
          position: [r * Math.cos(angle), r * Math.sin(angle), idx * 0.6],
        };
      }),
      normal0: [1, 0, 0],
    }),
    compBrush({
      // drawMode: 'line-strip',
      curve: range(200).map((idx) => {
        let angle = idx * 0.06;
        let r = 40;
        return {
          position: [r * Math.cos(angle), r * Math.sin(angle), idx * 0.6],
        };
      }),
      brush: [8, 0],
      brush1: [4, 4],
      brush2: [6, 3],
    })
  );
};
