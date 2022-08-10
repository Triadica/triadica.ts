import twgl from "twgl.js";

export let group = (options: any, ...children: any[]) => {
  return {
    type: "group",
    children: children,
  };
};

export type DrawMode = "triangles" | "lines" | "line-strip";

export let object = (options: {
  vertexShader: string;
  fragmentShader: string;
  drawMode: DrawMode;
  points?: number[][];
  indices?: number[];
  attributes?: { [key: string]: number[][] };
  groupedAttributes?: any[];
}) => {
  let arrays: any = {};
  let ret: any = {};

  // check points and indices
  if (options.points != null) {
    ret.position = createAttributeArray(options.points);
  }
  if (options.indices != null) {
    ret.indices = options.indices;
  }
  if (
    options.attributes != null &&
    Object.keys(options.attributes).length > 0
  ) {
    for (let key in options.attributes) {
      ret[key] = createAttributeArray(options.attributes[key]);
    }
  }

  arrays = ret;

  // check grouped attributes
  if (
    options.groupedAttributes != null &&
    options.groupedAttributes.length > 0
  ) {
    let g0 = peekGroupedAttrs(options.groupedAttributes);
    let names = Object.keys(g0);
    let size = countRecursive(options.groupedAttributes);
    let mutableLocalArrayCounter = 0;
    let collect = (info: Record<string, any>) => {
      let idx = mutableLocalArrayCounter;
      mutableLocalArrayCounter += 1;
      for (let name in names) {
        let d = info.name;
        if (Array.isArray(d) && d.length === 3) {
          let target = ret[name];
          let pos = idx * 3;
          target[pos] = d[0];
          target[pos + 1] = d[1];
          target[pos + 2] = d[2];
        } else if (Array.isArray(d) && d.length === 2) {
          let target = ret[name];
          let pos = idx * 2;
          target[pos] = d[0];
          target[pos + 1] = d[1];
        } else if (Array.isArray(d) && d.length === 1) {
          let target = ret[name];
          target[idx] = d[0];
        } else if (typeof d === "number") {
          let target = ret[name];
          target[idx] = d;
        } else {
          throw new Error(`Invalid data type for ${name}`);
        }
      }
    };
    for (let name in names) {
      ret[name] = twgl.primitives.createAugmentedTypedArray(
        Array.isArray(g0[name]) ? g0[name].length : 1,
        size,
        null
      );
    }
    buildGroupedAttrs(options.groupedAttributes, collect);

    Object.assign(arrays, ret);
  }
  return {
    type: "object",
    arrays: arrays,
  };
};

let createAttributeArray = (points: any[]) => {
  let p0 = points[0];
  let positionArray = twgl.primitives.createAugmentedTypedArray(
    1,
    points.length,
    Float32Array
  );
  if (Array.isArray(p0)) {
    let pps = points.flat(); // only flat once
    let num = p0.length;
    for (let i = 0; i < pps.length; i++) {
      // TODO type issue
      (positionArray as any)[i] = pps[i];
    }
  } else if (typeof p0 === "number") {
    let positionArray = twgl.primitives.createAugmentedTypedArray(
      1,
      points.length,
      Float32Array
    );
    for (let idx in points) {
      // TODO type issue
      (positionArray as any)[idx] = points[idx];
    }
  } else {
    twgl.primitives.createAugmentedTypedArray(1, points.length, null);
  }
};

let peekGroupedAttrs = (groupedAttrs: any): any => {
  if (Array.isArray(groupedAttrs)) {
    return peekGroupedAttrs(groupedAttrs[0]);
  } else {
    return groupedAttrs;
  }
};

let countRecursive = (xs: any[]): number => {
  if (Array.isArray(xs)) {
    return xs.reduce((acc, x) => acc + countRecursive(x), 0);
  } else {
    return 1;
  }
};

let buildGroupedAttrs = (data: any[], collect: (info: any) => void) => {
  if (Array.isArray(data)) {
    data.forEach((x) => {
      buildGroupedAttrs(x, collect);
    });
  } else {
    collect(data);
  }
};
