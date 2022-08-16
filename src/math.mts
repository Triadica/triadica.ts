import { V2 } from "./touch-control";

export let square = (x: number): number => {
  return x * x;
};

export let sumSquares = (...xs: number[]): number => {
  return xs.map(square).reduce((a, b) => a + b, 0);
};

// distance of complex numbers
export let cDistance = (x: V2, y: V2): number => {
  return Math.sqrt(sumSquares(x[0] - y[0], x[1] - y[1]));
};
