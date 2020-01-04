/**
 * @class module:SimpleSharedState.Store
 */

const objectPrototype = Object.getPrototypeOf({});

export default class Store {

	constructor(initialState = {}, devtool = null) {
		let stateTree = Object.assign({}, initialState);
		let isDispatching = false;
		const listeners = new Map();
		const snapshots = new Map();
		const dispatchListeners = new Set();

		/**
		 * @method module:SimpleSharedState.Store#watch
		 * @param {function} selector - A pure function which takes state and returns a piece of that state.
		 * @param {function} handler - The listener which will receive the piece of state when changes occur.
		 * @returns {function} A function to call to remove the listener.
		 *
		 * @description Creates a state listener which is associated with the selector. Every selector must
		 * be globally unique, as they're stored internally in a Set. If `watch` receives a selector which
		 * has already been passed before, `watch` will throw. Refer to the tests for more examples. `watch`
		 * returns a function which, when called, removes the watcher / listener.
		 */
		this.watch = (selector, handler) => {
			if (typeof selector !== 'function' || typeof handler !== 'function') {
				throw new Error("selector and handler must be functions");
			}
			if (listeners.has(selector)) {
				throw new Error("Cannot reuse selector");
			}

			let snapshot;
			try {
				snapshot = selector(stateTree);
			} catch (_) {}

			listeners.set(selector, handler);
			snapshots.set(selector, snapshot);

			return () => {
				listeners.delete(selector);
				snapshots.delete(selector);
			};
		};

		/**
		 * @method module:SimpleSharedState.Store#watchBatch
		 * @param {Array<function>|Set<function>} selectors - A Set or Array of selector functions. Refer to
		 * [Store#watch]{@link SimpleSharedState.Store#watch} for details about selector functions.
		 * @param {function} handler - The listener which will receive the Array of state snapshots.
		 * @returns {function} A callback that removes the dispatch watcher and cleans up after itself.
		 *
		 * @description Creates a dispatch listener from a list of selectors. Each selector yields a snapshot,
		 * which is stored in an array and updated whenever the state changes. When dispatch happens, your `handler`
		 * function will be called with the array of snapshots.
		 *
		 * @example
		 * import { createStore, partialArray, deleted } from "simple-shared-state";
		 *
		 * const store = createStore({
		 *   people: ["Alice", "Bob"],
		 * });
		 *
		 * const unwatch = store.watchBatch([
		 *   (state) => state.people[0],
		 *   (state) => state.people[1],
		 * ], (values) => console.log(values));
		 *
		 * store.dispatch({ people: partialArray(1, "John") });
		 * // [ 'Alice', 'John' ]
		 *
		 * store.dispatch({ people: partialArray([ "Janet", "Jake", "James" ] });
		 * // [ 'Janet', 'Jake' ]
		 * // notice "James" is not present, that's because of our selectors
		 *
		 * console.log(store.getState());
		 * // { people: [ 'Janet', 'Jake', 'James' ] }
		 *
		 * unwatch();
		 * store.dispatch({ people: [ "Justin", "Howard", deleted ] });
		 * // nothing happens, the watcher was removed
		 */
		this.watchBatch = (selectors, handler) => {
			if (!selectors || typeof selectors.forEach !== "function") {
				throw new Error("selectors must be a list of functions");
			}
			if (typeof handler !== "function") throw new Error("handler is not a function");

			const snapshotsArray = [];

			let i = 0;
			selectors.forEach((fn) => {
				if (typeof fn !== "function") {
					selectors.forEach((fn) => listeners.delete(fn));
					throw new Error("selector must be a function");
				}

				let pos = i++; // pos = 0, i += 1
				snapshotsArray[pos] = fn(stateTree);
				this.watch(fn, (snapshot) => snapshotsArray[pos] = snapshot);
			});

			const watchHandler = () => handler(snapshotsArray);
			dispatchListeners.add(watchHandler);

			return () => {
				dispatchListeners.delete(watchHandler);
				selectors.forEach((fn) => listeners.delete(fn));
			};
		};

		/**
		 * @method module:SimpleSharedState.Store#watchDispatch
		 *
		 * @description Listen for the after-dispatch event, which gets called with no arguments after every
		 * dispatch completes. Dispatch is complete after all watchers have been called.
		 *
		 * @param {function} handler - A callback function.
		 */
		this.watchDispatch = (handler) => {
			if (typeof handler !== "function") throw new Error("handler must be a function");
			dispatchListeners.add(handler);
			return () => dispatchListeners.delete(handler);
		};

		/**
		 * @method module:SimpleSharedState.Store#dispatch
		 *
		 * @param {object} branch - A JavaScript object. The object may contain any Array or JS primitive, but
		 * must be a plain JS object ({}) at the top level, otherwise dispatch will throw.
		 *
		 * @description Takes a state branch, which is any plain JS object that represents the desired change to
		 * state.
		 *
		 * @example
		 * import { createStore, deleted } from "simple-shared-state";
		 *
		 * // Create a store with state:
		 * const store = createStore({
		 *   email: "user@example.com",
		 *   counters: {
		 *     likes: 1,
		 *   },
		 *   todoList: [
		 *     { label: "buy oat milk" },
		 *     { label: "buy cat food" },
		 *   ],
		 * });
		 *
		 * // To change email, call dispatch with a branch. The branch you provide must include the full path
		 * // from the root of the state, to the value you want to change.
		 * store.dispatch({
		 *   email: "me@simplesharedstate.com",
		 * });
		 *
		 * // To update likes:
		 * store.dispatch({
		 *   counters: {
		 *     likes: 2,
		 *   },
		 * });
		 *
		 * // To delete any piece of state, use a reference to `deleted` as the value in the branch.
		 * // To remove `counters` from the state entirely:
		 * store.dispatch({
		 *   counters: deleted,
		 * });
		 *
		 * // To update items in arrays, you can use `partialArray`:
		 * store.dispatch({
		 *   todoList: partialArray(1, {
		 *     label: "buy oat milk (because it requires 80 times less water than almond milk)",
		 *   }),
		 * });
		 */
		this.dispatch = (branch) => {
			if (isDispatching) {
				throw new Error("can't dispatch while dispatching");
			}
			if (!branch || Object.getPrototypeOf(branch) !== objectPrototype) {
				throw new Error("dispatch expects plain object");
			}

			isDispatching = true;
			simpleMerge(stateTree, branch);

			listeners.forEach((handler, selector) => {
				let change = inapplicable;
				try {
					// attempt selector only on the branch
					change = selector(branch);

					// if this fails then something was deleted
					selector(stateTree);

					// If this line runs then selector didn't fail, so therefore,
					// if change is `undefined`, the selector is inapplicable, so
					// exit early.
					if (change === undefined) return;
				} catch (_) {
					// something was deleted, so proceed with `undefined`
					change = undefined;
				}

				const snapshot = snapshots.get(selector);
				if (change !== inapplicable && change !== snapshot) {
					const newSnapshot = simpleMerge(snapshot, change);
					handler(newSnapshot);
				}
			});

			isDispatching = false;

			dispatchListeners.forEach((callback) => callback());
		};

		/**
		 * @method module:SimpleSharedState.Store#getState
		 *
		 * @returns {Object} A copy of the state tree.
		 */
		this.getState = () => {
			return Object.assign({}, stateTree);
		};

		if (devtool && typeof devtool === 'function') {
			const devtoolStore = devtool((state) => state);
			this.watch((state) => state, devtoolStore.dispatch);
		}
	}
};

/**
 * @memberof module:SimpleSharedState
 * @const {number} deleted - A globally unique object to reference when you want to delete
 * things from state.
 *
 * @example
 * // `deleted` is essentially just a Symbol, but works in IE.
 * const deleted = new Number(0);
 * deleted === 0; // false
 * deleted === deleted; // true
 *
 * @example
 * // Use `deleted` to remove items from state.
 * import { createStore, deleted } from "simple-shared-state";
 *
 * const store = createStore({ a: 1, b: 2 });
 * console.log(store.getState()); // { a: 1, b: 2 }
 *
 * store.dispatch({
 *   b: deleted,
 * });
 *
 * // state: { a: 1 }
 */
export const deleted = new Number();

// Internal use only.
const inapplicable = new Number();

/**
 * @function module:SimpleSharedState#simpleMerge
 * @description This is for internal use. It's a simplified alternative to lodash.merge, and
 * cuts some corners for the sake of speed. Not knocking lodash at all, but lodash.merge is
 * likely intended for a wider set of use cases. For simple-shared-state, we choose speed over safety.
 *
 * @param {*} tree - any JS primitive or plain object or plain array. Tree will be mutated.
 * @param {*} branch - any JS primitive or plain object or plain array, but should share the
 * same root type as `tree`.
 *
 * @example
 * import { simpleMerge } from "simple-shared-state";
 *
 * const obj = { a: 1 };
 *
 * simpleMerge(obj, { b: 2 }); // returns { a: 1, b: 2 }
 *
 * console.log(obj); // { a: 1, b: 2 }
 */
export const simpleMerge = (tree, branch) => {
	if (tree && branch && typeof tree === "object") {
		Object.keys(branch).forEach((key) => {
			if (branch[key] === deleted) {
				delete tree[key];
			} else {
				tree[key] = simpleMerge(tree[key], branch[key]);
			}
		});
		return tree;
	}
	return branch;
};

/**
 * @function module:SimpleSharedState#partialArray
 * @description This is a helper for making partial arrays from a one-liner. You would use this
 * in your reducers when forming the new branch.
 *
 * @param {number} pos - the position where `thing` will be placed in the resulting array.
 * @param {object|array|number|boolean|string} thing - any JS primitive which you want to place
 * into the resulting array.
 * @returns {array}
 *
 * @example
 * import { partialArray } from "simple-shared-state";
 *
 * const change = partialArray(2, "thing");
 * console.log(change); // [ <2 empty items>, 'thing' ]
 * console.log(simpleMerge([ 0, 1, 2, 3 ], change)); // [ 0, 1, 'thing', 3 ]
 */
export const partialArray = (pos, thing) => {
	const array = [];
	array[pos] = thing;
	return array;
};
