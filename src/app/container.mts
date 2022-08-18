import { group } from "../alias.mjs";
import { compButton, compDragPoint, compSlider } from "../comp/control.mjs";
import { compStitch } from "../comp/stitch.mjs";
import { compAxis } from "../comp/axis.mjs";

import { FnDispatch, V3, V2 } from "../primes.mjs";

export let compContainer = (store: any) => {
  return group(
    {},
    compAxis(),
    compSlider({ position: [200, 100, 30] }, (delta: V2, dispatch: FnDispatch) => {
      console.log("delta", delta);
    }),
    compDragPoint({ position: store.p2 }, (p: V3, dispatch: FnDispatch) => {
      dispatch("move-p2", p);
    }),
    compButton({ position: [200, 200, 30], color: [0.2, 0.8, 0.7] }, (e, dispatch: FnDispatch) => {
      console.log("clicked");
    }),
    compStitch({
      position: [100, 200, 0],
      chars: [0xf2dfea34, 0xc3c4a59d, 0x88737645],
    })
  );
};
