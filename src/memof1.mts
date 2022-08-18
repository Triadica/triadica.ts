import { Atom } from "./atom.mjs";
import equal from "deep-equal";

let atomKeyedCallCaches = new Atom<Map<any, Record<string, [any, any][]>>>(new Map());

let atomSingletonCallCaches = new Atom<Map<any, [any, any][]>>(new Map());

export let memof1Call = (f: any, args: any[]) => {
  let caches = atomSingletonCallCaches.deref();
  if (caches.has(f)) {
    let pair = caches.get(f);
    if (equal(pair[0], args)) {
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
        if (equal(pair[0], args)) {
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
