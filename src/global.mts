import { TriadicaElement, TriadicaObjectData } from "./primes.mjs";
import { Atom } from "./atom.mjs";
import { TriadicaObjectBuffer } from "./alias.mjs";

export let atomGlContext = new Atom<WebGLRenderingContext>(null);

// tree for rendering and listeners
export let atomObjectsTree = new Atom<TriadicaElement>(null);

// proxy it for hot reloading
export let atomProxiedDispatch = new Atom<(op: string, data: any) => void>(null);

export let atomObjectsBuffer = new Atom<TriadicaObjectBuffer[]>([]);

export let atomMouseHoldingPaths = new Atom<number[][]>([]);
