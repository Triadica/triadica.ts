import * as twgl from "twgl.js";
import produce from "immer";

import { isDev } from "./config.mjs";
import { Atom } from "./atom.mjs";
import { atomGlContext } from "./global.mjs";
import { loadObjects, onControlEvent, paintCanvas, resetCanvasSize, setupMouseEvents } from "./index.mjs";
import { renderControl, replaceControlLoop, startControlLoop } from "@triadica/touch-control";
import { compContainer } from "./app/container.mjs";
import { updateStates } from "./cursor.mjs";
import { resetMemof1Caches } from "./memof1.mjs";
import { atomDirtyUniforms } from "./global.mjs";

let canvas = document.querySelector("canvas");

let atomStore = new Atom({
  v: 0,
  tab: "axis",
  p1: [0, 0, 0],
  p2: [40, 20, 0],
  states: {},
});

export let main = () => {
  twgl.setDefaults({
    attribPrefix: "a_",
  });

  // TODO inject hud

  resetCanvasSize(canvas);
  atomGlContext.reset(canvas.getContext("webgl", { antialias: true }));
  renderApp();

  renderControl();
  startControlLoop(10, onControlEvent);

  atomStore.addWatch("change", (prev, store) => {
    renderApp();
  });
  atomDirtyUniforms.addWatch("change", (prev, store) => {
    renderApp();
  });

  window.onresize = (event) => {
    resetCanvasSize(canvas);
    paintCanvas();
  };
  setupMouseEvents(canvas);
};

let renderApp = () => {
  loadObjects(compContainer(atomStore.deref()), dispatch);
  paintCanvas();
};

let dispatch = (op: string, data: any) => {
  if (isDev) {
    console.log(op, data);
  }

  let store = atomStore.deref();

  let next = (() => {
    switch (op) {
      case "states":
        return updateStates(store, data);
      case "tab-focus":
        return produce(store, (s) => {
          s.tab = data;
        });
      case "move-p2":
        return produce(store, (d) => {
          d.p2 = data;
        });
      default:
        return store;
    }
  })();

  if (next != null) {
    atomStore.reset(next); // TODO type for store
  }
};

export let reload = () => {
  resetMemof1Caches();
  renderApp();
  atomStore.removeWatch("change");
  atomStore.addWatch("change", (prev, store) => {
    renderApp();
  });

  replaceControlLoop(10, onControlEvent);
  setupMouseEvents(canvas);
  window.onresize = (event) => {
    resetCanvasSize(canvas);
    paintCanvas();
  };

  console.info("reloaded");
};
