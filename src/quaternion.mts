import { V3 } from "./primes.mjs";

/// calculate the cross product of two vectors
export let vCross = (a: V3, b: V3): V3 => {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
};

/// calculate the dot product of two vectors
export let vDot = (a: V3, b: V3): number => {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

export let vScale = (a: V3, b: number): V3 => {
  return [a[0] * b, a[1] * b, a[2] * b];
};

export let vAdd = (a: V3, b: V3): V3 => {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
};

export let vSub = (a: V3, b: V3): V3 => {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
};
