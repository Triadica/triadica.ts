import { Atom } from "./data.mjs";

export let atomGlContext = new Atom<WebGLRenderingContext>(null);

// tree for rendering and listeners
export let atomObjectsTree = new Atom<any>(null);

// proxy it for hot reloading
export let atomProxiedDispatch = new Atom<any>(null);

export let atomObjectsBuffer = new Atom<any[]>([]);
