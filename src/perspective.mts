import { vCross, vDot, vScale, vAdd, vSub } from "./quaternion.mjs";
import { backConeScale } from "./config.mjs";
import { Atom } from "./atom.mjs";
import { V3 } from "./primes.mjs";

export let atomViewerForward = new Atom<V3>([0, 0, -1]);

export let atomViewerPosition = new Atom<V3>([0, 0, 600]);

export let atomViewerUpward = new Atom<V3>([0, 1, 0]);

export let moveViewerBy = (x0: number, y0: number, z0: number) => {
  let dv = toViewerAxis(x0, y0, z0);
  let position = atomViewerPosition.deref();
  atomViewerPosition.reset(vAdd(position, dv));
};

export let newLookatPoint = (): V3 => {
  return vScale(atomViewerForward.deref(), 600);
};

export let rotateGlanceBy = (x: number, y: number) => {
  if (x !== 0) {
    let da = x * 0.1;
    let forward = atomViewerForward.deref();
    let upward = atomViewerUpward.deref();
    let rightward = vCross(upward, forward);
    atomViewerForward.reset(vAdd(vScale(forward, Math.cos(da)), vScale(rightward, Math.sin(da))));
  }
  if (y !== 0) {
    let da = y * 0.1;
    let forward = atomViewerForward.deref();
    let upward = atomViewerUpward.deref();
    atomViewerForward.reset(vAdd(vScale(forward, Math.cos(da)), vScale(upward, Math.sin(da))));
    atomViewerUpward.reset(vAdd(vScale(upward, Math.cos(da)), vScale(forward, -Math.sin(da))));
  }
};

export let spinGlanceBy = (v: number) => {
  if (v !== 0) {
    let da = v * 0.1;
    let forward = atomViewerForward.deref();
    let upward = atomViewerUpward.deref();
    let rightward = vCross(upward, forward);
    atomViewerUpward.reset(vAdd(vScale(upward, Math.cos(da)), vScale(rightward, Math.sin(da))));
  }
};

// |to-viewer-axis $ quote
//   defn to-viewer-axis (x y z) (; "\"converting from WebGL coordinate to object coordinate")
//     let
//         forward @*viewer-forward
//         upward @*viewer-upward
//         rightward $ v-cross upward forward
//       &v+
//         &v+
//           v-scale rightward $ negate x
//           v-scale upward y
//         v-scale forward $ negate z

export let toViewerAxis = (x: number, y: number, z: number): V3 => {
  let forward = atomViewerForward.deref();
  let upward = atomViewerUpward.deref();
  let rightward = vCross(upward, forward);
  return vAdd(vAdd(vScale(rightward, -x), vScale(upward, y)), vScale(forward, -z));
};

export let transform3d = (p0: V3): V3 => {
  let point = vSub(p0, atomViewerPosition.deref());
  let lookDistance = newLookatPoint();
  let upward = atomViewerUpward.deref();
  let rightward = vCross(upward, atomViewerForward.deref());
  let s = backConeScale;
  let r = vDot(point, lookDistance) / vSquare(lookDistance);
  let screenScale = (s + 1) / (r + s);
  let yp = vDot(point, upward) * screenScale;
  let xp = -vDot(point, rightward) * screenScale;
  let zp = r;

  return [xp, yp, zp];
};

let vSquare = (v: V3): number => {
  return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
};
