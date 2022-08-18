import * as twgl from "twgl.js";

import { DrawMode, PackedAttribute, TriadicaElement, TriadicaGroup, TriadicaHitRegion, TriadicaObjectData, TriadicaObjectOptions, V3 } from "./primes.mjs";

export let group = (options: Record<string, any>, ...children: TriadicaElement[]): TriadicaGroup => {
  return {
    type: "group",
    children: children,
  };
};

export interface TriadicaObjectBuffer {
  program: twgl.ProgramInfo;
  buffer: twgl.BufferInfo;
  drawMode: DrawMode;
  getUniforms: () => Record<string, any>;
  hitRegion?: TriadicaHitRegion;
}

export let object = (options: TriadicaObjectOptions): TriadicaObjectData => {
  let arrays: Record<string, any> = {};
  let ret: Record<string, ArrayBufferView | number[]> = {};

  // check points and indices
  if (options.points != null) {
    ret.position = createAttributeArray(options.points);
  }
  if (options.indices != null) {
    ret.indices = options.indices;
  }
  if (options.attributes != null && Object.keys(options.attributes).length > 0) {
    for (let key in options.attributes) {
      ret[key] = createAttributeArray(options.attributes[key] as any);
    }
  }

  arrays = ret;

  // check grouped attributes
  if (options.packedAttrs != null && options.packedAttrs.length > 0) {
    let g0 = peekPackedAttrs(options.packedAttrs);
    let names = Object.keys(g0);
    let size = countRecursive(options.packedAttrs);
    let mutableLocalArrayCounter = 0;
    let collect = (info: Record<string, any>) => {
      let idx = mutableLocalArrayCounter;
      mutableLocalArrayCounter += 1;
      for (let i in names) {
        let name = names[i];
        let d = info[name];
        if (Array.isArray(d) && d.length === 3) {
          let target = ret[name] as number[];
          let pos = idx * 3;
          target[pos] = d[0];
          target[pos + 1] = d[1];
          target[pos + 2] = d[2];
        } else if (Array.isArray(d) && d.length === 2) {
          let target = ret[name] as number[];
          let pos = idx * 2;
          target[pos] = d[0];
          target[pos + 1] = d[1];
        } else if (Array.isArray(d) && d.length === 1) {
          let target = ret[name] as number[];
          target[idx] = d[0];
        } else if (typeof d === "number") {
          let target = ret[name] as number[];
          target[idx] = d;
        } else {
          throw new Error(`Invalid data type for ${name}`);
        }
      }
    };
    for (let i in names) {
      let name = names[i];
      let num = Array.isArray(g0[name]) ? (g0[name] as number[]).length : 1;
      ret[name] = twgl.primitives.createAugmentedTypedArray(num, size, null);
    }
    buildPackedAttrs(options.packedAttrs, collect);

    Object.assign(arrays, ret);
  }
  return {
    type: "object",
    drawMode: options.drawMode,
    vertexShader: options.vertexShader,
    fragmentShader: options.fragmentShader,
    arrays: arrays,
    getUniforms: options.getUniforms,
    hitRegion: options.hitRegion,
  };
};

let createAttributeArray = (points: V3[]): ArrayBufferView => {
  let p0 = points[0];
  if (Array.isArray(p0)) {
    let pps = points.flat(); // only flat once
    let num = p0.length;
    let positionArray = twgl.primitives.createAugmentedTypedArray(num, points.length, Float32Array);
    for (let i = 0; i < pps.length; i++) {
      // TODO type issue
      (positionArray as any)[i] = pps[i];
    }
    return positionArray;
  } else if (typeof p0 === "number") {
    let positionArray = twgl.primitives.createAugmentedTypedArray(1, points.length, Float32Array);
    for (let idx in points) {
      // TODO type issue
      (positionArray as any)[idx] = points[idx];
    }
    return positionArray;
  } else {
    return twgl.primitives.createAugmentedTypedArray(1, points.length, null);
  }
};

let peekPackedAttrs = (packedAttrs: PackedAttribute): Record<string, number | number[]> => {
  if (Array.isArray(packedAttrs)) {
    return peekPackedAttrs(packedAttrs[0]);
  } else {
    return packedAttrs;
  }
};

let countRecursive = (xs: PackedAttribute): number => {
  if (Array.isArray(xs)) {
    return xs.reduce((acc, x) => acc + countRecursive(x), 0);
  } else {
    return 1;
  }
};

let buildPackedAttrs = (data: PackedAttribute, collect: (info: PackedAttribute) => void) => {
  if (Array.isArray(data)) {
    data.forEach((x) => {
      buildPackedAttrs(x, collect);
    });
  } else {
    collect(data);
  }
};
