import { group } from "../alias.mjs";
import { compButton, compDragPoint, compSlider } from "../comp/control.mjs";
import { compStitch } from "../comp/stitch.mjs";

import { FnDispatch, V3, V2 } from "../primes.mjs";

export interface TabData {
  name: string;
}

export let compTabs = (tabs: TabData[], onClick: (t: TabData, d: FnDispatch) => void) => {
  return group(
    {},
    ...tabs.map((t, idx) => {
      return compButton({ position: [300, 100 - idx * 40, 200] }, (e, dispatch: FnDispatch) => {
        onClick(t, dispatch);
      });
    })
  );
};
