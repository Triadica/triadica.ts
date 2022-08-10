import { group, object } from "alias.mjs";
import { Atom } from "data.mjs";

export let atomDirtyUniforms = new Atom({});

export let compContainer = (store: any) => {
  return group({}, compAxis());
};

let compAxis = () => {
  return object({
    vertexShader: "",
    fragmentShader: "",
    drawMode: "lines",
    points: [
      [-100, 0, 0],
      [100, 0, 0],
    ],
  });
};
