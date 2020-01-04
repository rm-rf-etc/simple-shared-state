import Store from "./store";
export { partialArray, simpleMerge, deleted } from "./store";

/** @module SimpleSharedState */

/**
 * @description Call this function to create a new store.
 *
 * @function createStore
 * @param {object} initialState - Any plain JS object (Arrays not allowed at the top level).
 * @param {function} [devtool] - Should be a reference to `window.__REDUX_DEVTOOLS_EXTENSION__`.
 * @returns {Store}
 */
export const createStore = (initialState = {}, devtool = null) => (
	new Store(initialState, devtool)
);
