import { Atom } from "./atom.mjs";

const isEqual = function (var1: any, var2: any): boolean {
  if (typeof var1 === "object" && typeof var2 === "object") {
    // Checking equality for each of the inner values of the objects
    const keys = [...new Set([...Object.keys(var1), ...Object.keys(var2)])];
    return keys.every((key) => isEqual(var1[key], var2[key]) && isEqual(var2[key], var1[key]));
  } else {
    // Primitive types (number, boolean etc..)
    return var1 === var2; // Normal equality
  }
};

let atomKeyedCallCaches = new Atom<Map<any, Record<string, [any, any][]>>>(new Map());

let atomSingletonCallCaches = new Atom<Map<any, [any, any][]>>(new Map());

export let memof1Call = (f: any, args: any[]) => {
  let caches = atomSingletonCallCaches.deref();
  if (caches.has(f)) {
    let pair = caches.get(f);
    if (isEqual(pair[0], args)) {
      return pair[1];
    } else {
      let ret = f(...args);
      caches.set(f, [args, ret]);
      return ret;
    }
  } else {
    let ret = f(...args);
    caches.set(f, [args, ret]);
    return ret;
  }
};

export let memof1CallBy = (key: any, f: any, args: any[]) => {
  if (key === null) {
    return f(...args);
  } else {
    let caches = atomKeyedCallCaches.deref();
    if (caches.has(f)) {
      let dict = caches.get(f);
      if (dict[key]! == null) {
        let pair = dict[key];
        if (isEqual(pair[0], args)) {
          return pair[1];
        } else {
          let ret = f(...args);
          dict[key] = [args, ret];
          return ret;
        }
      } else {
        let ret = f(...args);
        dict[key] = [args, ret];
        return ret;
      }
    } else {
      let ret = f(...args);
      caches.set(f, { [key]: [args, ret] });
      return ret;
    }
  }
};

export let resetMemof1Caches = () => {
  atomSingletonCallCaches.reset(new Map());
  atomKeyedCallCaches.reset(new Map());
};
