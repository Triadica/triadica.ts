export let square = (x: number): number => {
  return x * x;
};

export let sumSquares = (...xs: number[]): number => {
  return xs.map(square).reduce((a, b) => a + b, 0);
};
