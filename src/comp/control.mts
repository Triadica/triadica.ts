import { object, TriadicaObjectData } from "../alias.mjs";
import { V3, vAdd, vCross, vDot, vScale, vSub } from "../quaternion.mjs";
import { Atom } from "../data.mjs";
import { V2 } from "../touch-control.mjs";
import { FnDispatch } from "../primes.mjs";

let atomDragCache = new Atom<{ x: number; y: number }>({
  x: 0,
  y: 0,
});

import dragPointVertexShader from "../../shaders/drag-point.vert";
import dragPointFragmentShader from "../../shaders/drag-point.frag";
import { atomViewerForward, atomViewerPosition, atomViewerUpward, newLookatPoint } from "../perspective.mjs";
import { backConeScale } from "../config.mjs";

/** drag slider component for controlling 1 or 2 values */
export let compSlider = (
  props: {
    position: V3;
    size?: number;
    color?: V3;
  },
  onMove: (delta: V2, dispatch: FnDispatch) => void
): TriadicaObjectData => {
  let { position } = props;
  let geo: V3[] = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];
  let size = props.size ?? 20;
  let color = props.color ?? [0.6, 1, 0.56];
  let indices = [0, 5, 2, 1, 4, 2, 1, 5, 3, 0, 4, 3];
  let handleDrag = (x: number, y: number, d: FnDispatch) => {
    let prev = atomDragCache.deref();
    let dx = x - prev.x;
    let dy = prev.y - y;
    onMove([dx, dy], d);
  };
  return object({
    drawMode: "triangles",
    vertexShader: dragPointVertexShader,
    fragmentShader: dragPointFragmentShader,
    hitRegion: {
      position,
      radius: 20,
      onMousedown: (e: MouseEvent, d: FnDispatch) => {
        let x = e.clientX;
        let y = e.clientY;
        atomDragCache.reset({ x, y });
      },
      onMousemove: (e: MouseEvent, d: FnDispatch) => {
        let x = e.clientX;
        let y = e.clientY;
        handleDrag(x, y, d);
        atomDragCache.reset({ x, y });
      },
      onMouseup: (e: MouseEvent, d: FnDispatch) => {
        let x = e.clientX;
        let y = e.clientY;
        handleDrag(x, y, d);
      },
    },
    packedAttrs: indices.map((i) => ({
      position: vAdd(geo[i].map((x) => x * size) as V3, position),
      color,
    })),
  });
};

export let compDragPoint = (
  props: {
    position: V3;
    ignoreMoving?: boolean;
    size?: number;
    color?: V3;
  },
  onMove: (p: V3, d: FnDispatch) => void
): TriadicaObjectData => {
  let position = props.position;
  let ignoreMoving = props.ignoreMoving ?? false;
  let geo: V3[] = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];
  let size = props.size ?? 20;
  let color = props.color ?? [0.6, 1, 0.56];
  let indices = [0, 5, 2, 1, 4, 2, 1, 5, 3, 0, 4, 3];
  let handleDrag = (x: number, y: number, d: FnDispatch) => {
    let prev = atomDragCache.deref();
    let dx = x - prev.x;
    let dy = prev.y - y;
    let lookDistance = newLookatPoint();
    let upward = atomViewerUpward.deref();
    let rightward = vScale(vCross(upward, atomViewerForward.deref()), -1);
    let s = backConeScale;
    let r =
      vDot(vSub(position, atomViewerPosition.deref()), lookDistance) /
      (Math.pow(lookDistance[0], 2) + Math.pow(lookDistance[1], 2) + Math.pow(lookDistance[2], 2));
    let scaleRadio = window.innerWidth * 0.002 * 0.5;
    let screenScale = (r + s) / (s + 1);
    onMove(vAdd(position, vScale(vAdd(vScale(rightward, dx), vScale(upward, dy)), screenScale / scaleRadio)), d);
  };
  return object({
    drawMode: "triangles",
    vertexShader: dragPointVertexShader,
    fragmentShader: dragPointFragmentShader,
    hitRegion: {
      position,
      radius: size,
      onMousedown: (e: MouseEvent, d: FnDispatch) => {
        let x = e.clientX;
        let y = e.clientY;
        atomDragCache.reset({ x, y });
      },
      onMousemove: ignoreMoving
        ? null
        : (e: MouseEvent, d: FnDispatch) => {
            let x = e.clientX;
            let y = e.clientY;
            handleDrag(x, y, d);
            atomDragCache.reset({ x, y });
          },
      onMouseup(e, d) {
        let x = e.clientX;
        let y = e.clientY;
        handleDrag(x, y, d);
      },
    },
    packedAttrs: indices.map((i) => ({
      position: vAdd(geo[i].map((x) => x * size) as V3, position),
      color,
    })),
  });
};
