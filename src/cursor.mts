import produce from "immer";

/** states updater function */
export let updateStates = (store: any, pair: [string[], any]): typeof store => {
  let [cursor, newState] = pair;

  return produce(store, (s: any) => {
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
