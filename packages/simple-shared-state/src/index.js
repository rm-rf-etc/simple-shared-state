import Store from "./store";
export { partialArray, simpleMerge, deleted } from "./store";

/** @module SimpleSharedState */

/**
 * @description Call this function to create a new store.
 *
 * @function createStore
 * @param {object} initialState - Any plain JS object (Arrays not allowed at the top level).
 * @param {function} [actions] - A function, which takes a reference to `store`, and returns an object of
 * actions for invoking changes to state.
 * @param {function} [devtool] - Provide a reference to `window.__REDUX_DEVTOOLS_EXTENSION__` to enable
 * redux devtools.
 * @returns {Store}
 */
export const createStore = (initialState = {}, actions, devtool = null) => (
	new Store(initialState, actions, devtool)
);
