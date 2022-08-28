import { group } from "../alias.mjs";
import { compTabs } from "./tabs.mjs";
import { compButton, compDragPoint, compSlider } from "../comp/control.mjs";
import { compStitch } from "../comp/stitch.mjs";
import { compAxis } from "../comp/axis.mjs";

import { FnDispatch, V3, V2, TriadicaElement } from "../primes.mjs";

import { compJadeite } from "./jadeite.mjs";
import { compVortex } from "./vortex.mjs";

export let compContainer = (store: any) => {
  return group(
    {},
    compTabs(
      [
        { name: "axis" },
        {
          name: "control",
        },
        { name: "stitch" },
        { name: "jadeite" },
        { name: "vortex" },
      ],
      (t, dispatch) => {
        dispatch("tab-focus", t.name);
      }
    ),

    ((): TriadicaElement => {
      switch (store.tab) {
        case "axis":
          return compAxis();
        case "jadeite":
          return compJadeite();
        case "vortex":
          return compVortex();
        case "stitch":
          return compStitch({
            position: [10, 20, 0],
            chars: [0xf2dfea34, 0xc3c4a59d, 0x88737645],
          });
        case "control":
          return group(
            {},
            compSlider({ position: [200, 100, 30] }, (delta: V2, dispatch: FnDispatch) => {
              console.log("delta", delta);
            }),
            compDragPoint({ position: store.p2 }, (p: V3, dispatch: FnDispatch) => {
              dispatch("move-p2", p);
            }),
            compButton({ position: [200, 200, 30], color: [0.2, 0.8, 0.7] }, (e, dispatch: FnDispatch) => {
              console.log("clicked");
            })
          );
        default:
          console.warn("unknown tab:", store.tab);
          return compAxis();
      }
    })()
  );
};
