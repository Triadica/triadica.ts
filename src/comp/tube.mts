import { DrawMode, TriadicaElement, V2, V3 } from "../primes.mjs";
import { object } from "../alias.mjs";
import { range } from "../math.mjs";
import { vAdd, vCross, vNomalize, vScale, vSub } from "../quaternion.mjs";

import brushVert from "../../shaders/brush.vert";
import brushFrag from "../../shaders/brush.frag";
import linesVert from "../../shaders/lines.vert";
import linesFrag from "../../shaders/lines.frag";

export interface TubeOptions {
  drawMode?: DrawMode;
  curve: { position: V3 }[];
  /** defaults to 10 */
  radius?: number;
  /** defaults to [0,0,1] */
  normal0?: V3;
  /** defaults to 8 */
  circleStep?: number;
  vertexShader?: string;
  fragmentShader?: string;
  getUniforms?: () => Record<string, any>;
}

export let compTube = (options: TubeOptions): TriadicaElement => {
  let points = options.curve;
  let radius = options.radius || 10;
  let normal0 = options.normal0 || [0, 0, 1];
  let circleStep = options.circleStep || 8;
  let dAngle = (2 * Math.PI) / circleStep;
  return object({
    drawMode: options.drawMode || "triangles",
    vertexShader: options.vertexShader || linesVert,
    fragmentShader: options.fragmentShader || linesFrag,
    getUniforms: options.getUniforms,
    packedAttrs: range(points.length - 1).map((idx) => {
      let pRaw = points[idx];
      let qRaw = points[idx + 1];
      let notAtEnd = idx + 2 < points.length;
      let p = pRaw.position;
      let q = qRaw.position;
      let q2 = notAtEnd ? points[idx + 2].position : q;
      let v = vSub(q, p);
      let v2 = notAtEnd ? vSub(q2, p) : v;
      let direction1 = vNomalize(vCross(v, normal0));
      let direction2 = vNomalize(vCross(direction1, v));
      let direction3 = vNomalize(vCross(v2, normal0));
      let direction4 = vNomalize(vCross(direction3, v2));
      return range(circleStep).map((cIdx) => {
        let p0 = vAdd(vAdd(p, vScale(direction1, radius * Math.cos(dAngle * cIdx))), vScale(direction2, radius * Math.sin(dAngle * cIdx)));
        let p1 = vAdd(vAdd(p, vScale(direction1, radius * Math.cos(dAngle * (cIdx + 1)))), vScale(direction2, radius * Math.sin(dAngle * (cIdx + 1))));
        let p2 = vAdd(vAdd(q, vScale(direction3, radius * Math.cos(dAngle * cIdx))), vScale(direction4, radius * Math.sin(dAngle * cIdx)));
        let p3 = vAdd(vAdd(q, vScale(direction3, radius * Math.cos(dAngle * (cIdx + 1)))), vScale(direction4, radius * Math.sin(dAngle * (cIdx + 1))));
        return [
          { ...pRaw, position: p0 },
          { ...pRaw, position: p1 },
          { ...qRaw, position: p2 },
          { ...pRaw, position: p1 },
          { ...qRaw, position: p2 },
          { ...qRaw, position: p3 },
        ];
      });
    }),
  });
};

export interface BrushOptions {
  curve: { position: V3 }[];
  /** defaults to [8, 0] */
  brush?: V2;
  brush1?: V2;
  brush2: V2;
  /** defaults to triangles */
  drawMode?: DrawMode;
  vertexShader?: string;
  fragmentShader?: string;
  getUniforms?: () => Record<string, any>;
}

export let compBrush = (options: BrushOptions): TriadicaElement => {
  let points = options.curve;
  let brush = options.brush || [8, 0];
  let brush1 = options.brush1;
  let brush2 = options.brush2;
  return object({
    drawMode: options.drawMode ?? "triangles",
    vertexShader: options.vertexShader ?? brushVert,
    fragmentShader: options.fragmentShader ?? brushFrag,
    getUniforms: options.getUniforms,
    packedAttrs: range(points.length - 1).map((idx) => {
      let pRaw = points[idx];
      let qRaw = points[idx + 1];
      let p = pRaw.position;
      let q = qRaw.position;
      return [
        [
          { ...pRaw, brush: [0, 0] },
          { ...pRaw, brush: brush },
          { ...qRaw, brush: [0, 0] },
          { ...pRaw, brush: brush },
          { ...qRaw, brush: [0, 0] },
          { ...qRaw, brush: brush },
        ],
        brush1 != null
          ? [
              { ...pRaw, brush: [0, 0] },
              { ...pRaw, brush: brush1 },
              { ...qRaw, brush: [0, 0] },
              { ...pRaw, brush: brush1 },
              { ...qRaw, brush: [0, 0] },
              { ...qRaw, brush: brush1 },
            ]
          : [],
        brush2 != null
          ? [
              { ...pRaw, brush: [0, 0] },
              { ...pRaw, brush: brush2 },
              { ...qRaw, brush: [0, 0] },
              { ...pRaw, brush: brush2 },
              { ...qRaw, brush: [0, 0] },
              { ...qRaw, brush: brush2 },
            ]
          : [],
      ];
    }),
  });
};
