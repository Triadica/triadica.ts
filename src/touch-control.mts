import { Atom } from "./atom.mjs";
import { V2 } from "./primes.mjs";

/** element data for building DOM */
class MarkupElement {
  props: Record<string, any>;
  events: Record<string, any>;
  children: MarkupElement[];
  constructor(props: Record<string, any>, events: Record<string, any>, children: MarkupElement[]) {
    this.props = props;
    this.events = events;
    this.children = children;
  }
}

// complex minus
let complex_minus = (a: V2, b: V2) => {
  return [a[0] - b[0], a[1] - b[1]];
};

let atomContainer = new Atom<HTMLDivElement>(null);

let atomControlStates = new Atom({
  leftA: false,
  leftB: false,
  rightA: false,
  rightB: false,
  leftMove: [0, 0] as V2,
  leftPrev: [0, 0] as V2,
  rightMove: [0, 0] as V2,
  rightPrev: [0, 0] as V2,
});

let atomLastTick = new Atom(performance.now());

let atomLeftOrigin = new Atom([0, 0]);

let atomPrevControlStates = new Atom({
  leftMove: [0, 0] as V2,
  rightMove: [0, 0] as V2,
});

let atomRaqLoop = new Atom(null);

let atomRightOrigin = new Atom([0, 0]);

let atomShiftListener = new Atom(
  (() => {
    window.addEventListener("keydown", (event) => {
      if (event.shiftKey && !atomShiftListener.deref()) {
        atomShiftListener.reset(true);
      }
    });
    window.addEventListener("keyup", (event) => {
      if (!event.shiftKey && atomShiftListener.deref()) {
        atomShiftListener.reset(false);
      }
    });

    return false;
  })()
);

let atomTimeoutLoop = new Atom(null);

export let clearControlLoop = () => {
  clearTimeout(atomTimeoutLoop.deref());
  cancelAnimationFrame(atomRaqLoop.deref());
};

let connectState = (field: string) => {
  return {
    pointerdown: (event: PointerEvent) => {
      // js/console.log "\"down" event
      atomControlStates.swap((controlStates) => {
        return {
          ...controlStates,
          [field]: true,
        };
      });
    },
    pointerup: (event: PointerEvent) => {
      // js/console.log "\"up" event
      atomControlStates.swap((controlStates) => {
        return {
          ...controlStates,
          [field]: false,
        };
      });
    },
  };
};

let div = (props: any, events: Record<string, any>, ...children: MarkupElement[]) => {
  return new MarkupElement(props, events, children);
};

let leftEvents = (() => {
  let onLeave = (event: PointerEvent) => {
    atomControlStates.swap((controlStates) => {
      return {
        ...controlStates,
        leftMove: [0, 0],
      };
    });
    atomPrevControlStates.swap((prevControlStates) => {
      return {
        ...prevControlStates,
        leftMove: [0, 0],
      };
    });
  };
  let onEnter = (event: PointerEvent) => {
    atomLeftOrigin.reset([(event as any).layerX, (event as any).layerY]);
    atomControlStates.swap((controlStates) => {
      return {
        ...controlStates,
        leftMove: [0, 0],
      };
    });
    atomPrevControlStates.swap((prevControlStates) => {
      return {
        ...prevControlStates,
        leftMove: [0, 0],
      };
    });
  };
  return {
    pointerdown: onEnter,
    pointerenter: onEnter,
    mouseleave: onLeave,
    pointerup: onLeave,
    pointermove: (event: PointerEvent) => {
      let move: V2 = [(event as any).layerX - atomLeftOrigin.deref()[0], atomLeftOrigin.deref()[1] - (event as any).layerY];
      atomControlStates.swap((controlStates) => {
        return {
          ...controlStates,
          leftMove: move,
        };
      });
    },
  };
})();

export let renderControl = () => {
  if (atomContainer.deref()) {
    atomContainer.deref().remove();
  }
  let panel = div(
    { className: "touch-control" },
    {},
    div(
      { className: "left-group" },
      {},
      div({ className: "left-hand hand-button" }, leftEvents, div({ className: "hand-center" }, {})),
      div({ className: "left-a circle-button" }, connectState("leftA")),
      div({ className: "left-b circle-button" }, connectState("leftB"))
    ),
    div(
      { className: "right-group" },
      {},
      div({ className: "right-hand hand-button" }, rightEvents, div({ className: "hand-center" }, {})),
      div({ className: "right-a circle-button" }, connectState("rightA")),
      div({ className: "right-b circle-button" }, connectState("rightB"))
    )
  );
  // console.log(panel);
  let dom = renderDom(panel, document.body);
  atomContainer.reset(dom);
};

let renderDom = (el: MarkupElement, parent: HTMLElement) => {
  let div = document.createElement("div");
  let props = el.props;
  let events = el.events;
  let children = el.children;
  for (let k in props) {
    let v = props[k];
    (div as any)[k] = v;
  }
  for (let k in events) {
    let v = events[k];
    div.addEventListener(k, v, false);
  }
  for (let idx in children) {
    let child = children[idx];
    renderDom(child, div);
  }
  parent.appendChild(div);

  return div;
};

export let replaceControlLoop = (duration: number, f: (elapsed: number, states: any, g: any) => void) => {
  clearControlLoop();
  startControlLoop(duration, f);
};

/** control events data emitted from touches */
export interface ControlStates {
  leftMove: V2;
  rightMove: V2;
  leftA: boolean;
  leftB: boolean;
  rightA: boolean;
  rightB: boolean;
  shift: boolean;
}

let rightEvents = (() => {
  let onEnter = (event: PointerEvent) => {
    atomRightOrigin.reset([(event as any).layerX, (event as any).layerY]);
    atomControlStates.swap((controlStates) => {
      return {
        ...controlStates,
        rightMove: [0, 0],
      };
    });
  };
  let onLeave = (event: PointerEvent) => {
    atomControlStates.swap((controlStates) => {
      return {
        ...controlStates,
        rightMove: [0, 0],
      };
    });
    atomPrevControlStates.swap((state) => {
      return {
        ...state,
        rightMove: [0, 0],
      };
    });
  };
  return {
    pointerdown: onEnter,
    pointerup: onLeave,
    mouseenter: onEnter,
    mouseleave: onLeave,
    pointermove: (event: PointerEvent) => {
      let move: V2 = [(event as any).layerX - atomRightOrigin.deref()[0], atomRightOrigin.deref()[1] - (event as any).layerY];
      atomControlStates.swap((controlStates) => {
        return {
          ...controlStates,
          rightMove: move,
        };
      });
    },
  };
})();

export let startControlLoop = (duration: number, f: (elapsed: number, states: ControlStates, g: any) => void) => {
  let now = performance.now();
  let elapsed = (now - atomLastTick.deref()) / 1000;
  let shift = atomShiftListener.deref();
  let states = atomControlStates.deref();
  f(
    elapsed,
    {
      ...states,
      shift: shift,
    },
    {
      leftMove: complex_minus(states.leftMove, atomPrevControlStates.deref().leftMove),
      rightMove: complex_minus(states.rightMove, atomPrevControlStates.deref().rightMove),
    }
  );
  atomLastTick.reset(now);
  atomPrevControlStates.reset({
    leftMove: states.leftMove,
    rightMove: states.rightMove,
  });
  if (states.leftA && states.rightA) {
    tryFullscreen();
  }
  atomTimeoutLoop.reset(
    setTimeout(() => {
      atomRaqLoop.reset(
        requestAnimationFrame(() => {
          startControlLoop(duration, f);
        })
      );
    }, duration)
  );
};

let tryFullscreen = () => {
  if (window.innerHeight !== screen.height) {
    document.documentElement.requestFullscreen();
  }
};
