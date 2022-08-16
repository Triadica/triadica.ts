import { V2 } from "./touch-control.js";
import { Atom } from "./data.mjs";
import { TriadicaElement, TriadicaObjectBuffer, TriadicaObjectData } from "./alias.mjs";

export let atomGlContext = new Atom<WebGLRenderingContext>(null);

// tree for rendering and listeners
export let atomObjectsTree = new Atom<TriadicaElement>(null);

// proxy it for hot reloading
export let atomProxiedDispatch = new Atom<Function>(null);

export let atomObjectsBuffer = new Atom<TriadicaObjectBuffer[]>([]);

export let atomMouseHoldingPaths = new Atom<number[][]>([]);
