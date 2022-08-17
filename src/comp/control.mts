import { object, TriadicaObjectData } from "../alias.mjs";
import { V3, vAdd } from "../quaternion.mjs";
import { Atom } from "../data.mjs";
import { V2 } from "../touch-control.mjs";
import { FnDispatch } from "../primes.mjs";

let atomDragCache = new Atom<{ x: number; y: number }>({
  x: 0,
  y: 0,
});

import dragPointVertexShader from "../../shaders/drag-point.vert";
import dragPointFragmentShader from "../../shaders/drag-point.frag";

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
  let handleDrag = (x: number, y: number, d: (op: string, data: any) => void) => {
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
      onMousedown: (e: MouseEvent, d: (op: string, data: any) => void) => {
        let x = e.clientX;
        let y = e.clientY;
        atomDragCache.reset({ x, y });
      },
      onMousemove: (e: MouseEvent, d: (op: string, data: any) => void) => {
        let x = e.clientX;
        let y = e.clientY;
        handleDrag(x, y, d);
        atomDragCache.reset({ x, y });
      },
      onMouseup: (e: MouseEvent, d: (op: string, data: any) => void) => {
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
