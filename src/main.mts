import { isDev } from "./config.mjs";
import { Atom } from "./data.mjs";
import { atomGlContext } from "./global.mjs";
import { loadObjects, onControlEvent, paintCanvas, resetCanvasSize, setupMouseEvents } from "./index.mjs";
import * as twgl from "twgl.js";
import produce from "immer";
import { atomDirtyUniforms, compContainer } from "./app/container.mjs";
import { renderControl, replaceControlLoop, startControlLoop } from "./touch-control.mjs";

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

  if (op === "city-spin") {
    // TODO
  } else {
    let store = atomStore.deref();
    let next = Array.isArray(op)
      ? updateStates(store, [op, data])
      : (() => {
          switch (op) {
            case "tab-focus":
              return produce(store, (s) => {
                s.tab = data;
              });
            case "move-p2":
              return produce(store, (d) => {
                d.p2 = data;
              });
            default:
              return null;
          }
        })();

    if (next != null) {
      atomStore.reset(next as any); // TODO type for store
    }
  }
};

let updateStates = (store: any, pair: [string[], any]) => {
  let [cursor, newState] = pair;

  produce(store, (s: any) => {
    let state = s.states;
    for (let i = 0; i < cursor.length; i++) {
      if (state[cursor[i]] == null) {
        state[cursor[i]] = { data: {} };
      }
      state = state[cursor[i]];
    }
    state.data = newState;
  });
};

export let reload = () => {
  // TODO reset-memof1-caches
  atomStore.removeWatch("change");
  atomStore.addWatch("change", (prev, store) => {
    renderApp();
  });
  // TODO replace-control-loop
  replaceControlLoop(10, onControlEvent);
  setupMouseEvents(canvas);
  window.onresize = (event) => {
    resetCanvasSize(canvas);
    paintCanvas();
  };

  console.info("reloaded");
};
