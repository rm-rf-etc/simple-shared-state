/**
 * @class module:SimpleSharedState.Store
 */

const objectPrototype = Object.getPrototypeOf({});

export default class Store {

	constructor(initialState = {}, devtool = null) {
		let stateTree = { ...initialState };
		let isDispatching = false;
		const listeners = new Map();
		const snapshots = new Map();
		const afterListeners = new Set();

		/**
		 * @method module:SimpleSharedState.Store#watch
		 * @param {function} - selector A pure function which takes state and returns a piece of that state.
		 * @param {function} - handler The listener which will receive the piece of state when changes occur.
		 *
		 * @description Creates a state listener which is associated with a globally unique selector. If watch
		 * receives a selector which has already been passed before, watch will throw. Selectors are tested
		 * for equality using `===`, which means you can have any number of identical selectors, so long as
		 * each is a unique JavaScript reference. Refer to the test "createStore", "should throw when ..."
		 * for examples.
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
			return snapshot;
		};

		/**
		 * @method module:SimpleSharedState.Store#afterDispatch
		 *
		 * @description Listen for the after-dispatch event, which gets called with no arguments after every
		 * dispatch completes. Dispatch is complete after all watchers have been called.
		 *
		 * @param {function} - A callback function.
		 */
		this.afterDispatch = (callback) => {
			if (typeof callback === "function") afterListeners.add(callback);
		};

		/**
		 * @method module:SimpleSharedState.Store#unwatch
		 *
		 * @description Remove a previously added state listener. You must provide a reference to the same selector
		 * function as was previously provided when calling #watch.
		 *
		 * @param {function} selector - A unique reference to a selector function which was previously provided in
		 * a call to #watch.
		 */
		this.unwatch = (selector) => {
			listeners.delete(selector);
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

			listeners.forEach((handler, selector) => {
				let changed;
				try {
					changed = selector(branch);
				} catch (_) {
					return;
				}

				const snapshot = snapshots.get(selector);
				simpleMerge(snapshot, changed);
				handler(snapshot);
			});

			simpleMerge(stateTree, branch);
			isDispatching = false;

			afterListeners.forEach((callback) => callback());
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
export const deleted = new Number(0);

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
