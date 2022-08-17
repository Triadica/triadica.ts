import { group, object, TriadicaObjectData } from "../alias.mjs";
import { Atom } from "../data.mjs";
import { compButton, compDragPoint, compSlider } from "../comp/control.mjs";

import vs from "../../shaders/lines.vert";
import fs from "../../shaders/lines.frag";
import { V2 } from "../touch-control.mjs";
import { FnDispatch } from "../primes.mjs";
import { V3 } from "../quaternion.mjs";

export let atomDirtyUniforms = new Atom({});

export let compContainer = (store: any) => {
  return group(
    {},
    compAxis(),
    compSlider(
      {
        position: [200, 100, 30],
      },
      (delta: V2, dispatch: FnDispatch) => {
        console.log("delta", delta);
      }
    ),
    compDragPoint(
      {
        position: store.p2,
      },
      (p: V3, dispatch: FnDispatch) => {
        dispatch("move-p2", p);
      }
    ),
    compButton(
      {
        position: [200, 200, 30],
        color: [0.2, 0.8, 0.7],
      },
      (e, dispatch: FnDispatch) => {
        console.log("clicked");
      }
    )
  );
};

let compAxis = (): TriadicaObjectData => {
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
