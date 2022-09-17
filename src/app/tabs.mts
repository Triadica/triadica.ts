import { group } from "../alias.mjs";
import { compButton, compDragPoint, compSlider } from "../comp/control.mjs";
import { compStitch } from "../comp/stitch.mjs";

import { FnDispatch, V3, V2 } from "../primes.mjs";

export interface TabData {
  name: string;
}

export let compTabs = (tabs: TabData[], options: { selected?: string }, onClick: (t: TabData, d: FnDispatch) => void) => {
  let selected = options.selected;
  return group(
    {},
    ...tabs.map((t, idx) => {
      return compButton({ position: [300, 100 - idx * 40, 200], color: t.name === selected ? [0.2, 0.8, 0.6] : [0.6, 0.9, 0.7] }, (e, dispatch: FnDispatch) => {
        onClick(t, dispatch);
      });
    })
  );
};
