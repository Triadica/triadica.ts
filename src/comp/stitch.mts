import { group, object } from "../alias.mjs";
import { V2, V3 } from "../primes.mjs";
import { vAdd, vScale } from "../quaternion.mjs";

let stitchStrokes = (() => {
  let shift = 0.2;
  return [0, 1, 2, 3].flatMap((i) => {
    return [0, 1, 2, 3].flatMap((j) => {
      let base: V3 = [1 + j * 2, -2 * i - 1, 0];
      let baseIdx = 2 * (i * 4 + j);
      return [
        {
          position: vAdd(base, [0.2, 0.2, shift]),
          data: baseIdx,
        },
        {
          position: vAdd(base, [-0.2, -0.2, shift]),
          data: baseIdx,
        },
        {
          position: vAdd(base, [2.2, -1.8, shift]),
          data: baseIdx,
        },
        {
          position: vAdd(base, [-0.2, -0.2, shift]),
          data: baseIdx,
        },
        {
          position: vAdd(base, [2.2, -1.8, shift]),
          data: baseIdx,
        },
        {
          position: vAdd(base, [1.8, -2.2, shift]),
          data: baseIdx,
        },
        {
          position: vAdd(base, [1.8, 0.2, shift]),
          data: baseIdx + 1,
        },
        {
          position: vAdd(base, [2.2, -0.2, shift]),
          data: baseIdx + 1,
        },
        {
          position: vAdd(base, [-0.2, -1.8, shift]),
          data: baseIdx + 1,
        },
        {
          position: vAdd(base, [2.2, -0.2, shift]),
          data: baseIdx + 1,
        },
        {
          position: vAdd(base, [0.2, -2.2, shift]),
          data: baseIdx + 1,
        },
        {
          position: vAdd(base, [-0.2, -1.8, shift]),
          data: baseIdx + 1,
        },
      ];
    });
  });
})();

import shaderStitchBgVert from "../../shaders/stitch-bg.vert";
import shaderStitchLineVert from "../../shaders/stitch-line.vert";
import shaderStitchBgFrag from "../../shaders/stitch-bg.frag";
import shaderStitchLineFrag from "../../shaders/stitch-line.frag";

export let compStitch = (props: { chars: number[]; position: V3 }) => {
  let chars = props.chars ?? [0x1111];
  let position = props.position ?? [0, 0, 0];
  let size = 24;
  let gap = 4;
  let s0 = 0.1 * size;
  return group(
    {},
    object({
      drawMode: "triangles",
      vertexShader: shaderStitchBgVert,
      fragmentShader: shaderStitchBgFrag,
      packedAttrs: chars.map((c, idx) => {
        return (
          [
            [0, 0, 0],
            [1, 0, 0],
            [1, -1, 0],
            [0, 0, 0],
            [1, -1, 0],
            [0, -1, 0],
          ] as V3[]
        ).map((x) => {
          return {
            position: vAdd(vAdd(vScale(x, size), position), vScale([size + gap, 0, 0], idx)),
          };
        });
      }),
    }),
    object({
      drawMode: "triangles",
      vertexShader: shaderStitchLineVert,
      fragmentShader: shaderStitchLineFrag,
      packedAttrs: chars.map((c, idx) => {
        let pattern = c.toString(2).slice(2).padStart(32, "0");
        return stitchStrokes.map((info) => {
          let x = info.position;
          let dataIdx = info.data;
          return {
            position: vAdd(vAdd(vScale(x, s0), position), vScale([size + gap, 0, 0], idx)),
            value: pattern.charAt(dataIdx) == "1" ? 1 : 0,
          };
        });
      }),
    })
  );
};
