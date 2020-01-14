import {
	merge,
	deleted,
	PartialArray,
	pop,
	shift,
	isArray,
} from "./merge";

/**
 * @module SimpleSharedState
 */

const objectPrototype = Object.getPrototypeOf({});

/**
 * @description Create a new store instance.
 *
 * @constructor
 * @param {object} initialState - Any plain JS object (Arrays not allowed at the top level).
 * @param {function} [actions] - A function, which takes a reference to `store`, and returns an object of
 * actions for invoking changes to state.
 * @param {function} [devtool] - Provide a reference to `window.__REDUX_DEVTOOLS_EXTENSION__` to enable
 * redux devtools.
 */
export class Store {

	constructor(initialState = {}, getActions, useDevtool) {
		this.devtool;
		this.stateTree = Object.assign({}, initialState);
		this.dispatching = false;
		this.listeners = new Map();
		this.snapshots = new Map();
		this.dispatchListeners = new Set();
		this.actions = {};

		if (useDevtool && useDevtool.connect && typeof useDevtool.connect === "function") {
			// this adapts SimpleSharedState to work with redux devtools
			this.devtool = useDevtool.connect();
			this.devtool.subscribe((message) => {
				if (message.type === "DISPATCH" && message.payload.type === "JUMP_TO_STATE") {
					this._applyBranch(JSON.parse(message.state));
				}
			});
			this.devtool.init(this.stateTree);
		}

		if (getActions && typeof getActions === "function") {
			const actions = getActions(this);

			Object.keys(actions).forEach((actionName) => {
				const actionType = this.devtool ? `${actionName}()` : "";

				this.actions[actionName] = (...args) => {
					this.dispatch(actionType, actions[actionName].apply(null, args));
				};
			});
		}
	}

	_applyBranch(branch) {
		this.dispatching = true;
		this.stateTree = Object.assign({}, this.stateTree);
		merge(this.stateTree, branch);

		this.listeners.forEach((handler, selector) => {
			let change;
			const snapshot = this.snapshots.get(selector);
			const submit = (value) => {
				this.snapshots.set(selector, value);
				handler(value);
			};

			try {
				// attempt selector only on the branch
				change = selector(branch);

				switch(change) {
					case snapshot:
						return;
					case deleted:
						if (snapshot !== undefined) submit(undefined);
						return;
					case pop:
						submit(selector(this.stateTree));
						return;
					case shift:
						submit(selector(this.stateTree));
						return;
					case undefined:
						change = selector(this.stateTree);
						// If ^this line throws, then **current state is also not applicable**,
						// meaning something was deleted, so we should proceed to catch block.
						return;
						// If `return` runs, then selector didn't throw, so exit early.
				}
			}
			catch (_) {
				try {
					selector(this.stateTree);
					// If ^selector works on new state then exit early.
					return;
				} catch (_) {}
			}

			// This test also covers the scenario where both are undefined.
			if (change === snapshot) return;

			if (isArray(change) && !change.isPartial) {
				submit(change);
			} else {
				submit(merge(snapshot, change));
			}
		});

		this.dispatchListeners.forEach((callback) => callback());
		this.dispatching = false;
	};

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
	watch(selector, handler, runNow = true) {
		if (typeof selector !== "function" || typeof handler !== "function") {
			throw new Error("selector and handler must be functions");
		}
		if (this.listeners.has(selector)) {
			throw new Error("Cannot reuse selector");
		}

		let snapshot;
		try {
			snapshot = selector(this.stateTree);
			if (runNow) handler(snapshot);
		} catch (_) {}

		this.listeners.set(selector, handler);
		this.snapshots.set(selector, snapshot);

		return () => {
			this.listeners.delete(selector);
			this.snapshots.delete(selector);
		};
	};

	/**
	 * @method module:SimpleSharedState.Store#watchBatch
	 * @param {Array<function>|Set<function>} selectors - A Set or Array of selector functions. Refer to
	 * [Store#watch]{@link module:SimpleSharedState.Store#watch} for details about selector functions.
	 * @param {function} handler - The listener which will receive the Array of state snapshots.
	 * @returns {function} A callback that removes the dispatch watcher and cleans up after itself.
	 *
	 * @description Creates a dispatch listener from a list of selectors. Each selector yields a snapshot,
	 * which is stored in an array and updated whenever the state changes. When dispatch happens, your
	 * `handler` function will be called with the array of snapshots, ***if*** any snapshots have changed.
	 *
	 * @example
	 * import { createStore, partialArray } from "simple-shared-state";
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
	 * store.dispatch("", { people: partialArray(1, "John") });
	 * // [ 'Alice', 'John' ]
	 *
	 * store.dispatch("", { people: [ "Janet", "Jake", "James" ] });
	 * // [ 'Janet', 'Jake' ]
	 * // notice "James" is not present, that's because of our selectors
	 *
	 * console.log(store.getState(s => s.people));
	 * // [ 'Janet', 'Jake', 'James' ]
	 *
	 * unwatch();
	 * store.dispatch("", { people: [ "Justin", "Josh", store.deleted ] });
	 * // nothing happens, the watcher was removed
	 *
	 * console.log(store.getState(s => s.people));
	 * // [ 'Justin', 'Josh', <1 empty item> ]
	 */
	watchBatch(selectors, handler) {
		if (!selectors || typeof selectors.forEach !== "function") {
			throw new Error("selectors must be a list of functions");
		}
		if (typeof handler !== "function") throw new Error("handler is not a function");

		const snapshotsArray = [];

		let i = 0;
		let changed = false;
		selectors.forEach((fn) => {
			if (typeof fn !== "function") {
				selectors.forEach((fn) => this.listeners.delete(fn));
				throw new Error("selector must be a function");
			}

			let pos = i++; // pos = 0, i += 1
			try {
				snapshotsArray[pos] = fn(this.stateTree);
			} catch (_) {
				snapshotsArray[pos] = undefined;
			}
			this.watch(fn, (snapshot) => {
				snapshotsArray[pos] = snapshot;
				changed = true;
			}, false);
		});

		const watchHandler = () => {
			if (changed) {
				handler(snapshotsArray.slice());
				changed = false;
			}
		};
		this.dispatchListeners.add(watchHandler);

		handler(snapshotsArray.slice());

		return () => {
			this.dispatchListeners.delete(watchHandler);
			selectors.forEach((fn) => this.listeners.delete(fn));
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
	watchDispatch(handler) {
		if (typeof handler !== "function") throw new Error("handler must be a function");
		this.dispatchListeners.add(handler);
		return () => this.dispatchListeners.delete(handler);
	};

	/**
	 * @method module:SimpleSharedState.Store#getState
	 *
	 * @param {function} [selector] - Optional but recommended function which returns a piece of the state.
	 * Error handling not required, your selector will run inside a `try{} catch{}` block.
	 * @returns {*} A copy of the state tree, or a copy of the piece returned from the selector, or
	 * undefined if the selector fails.
	 */
	getState(selector) {
		if (selector && typeof selector === "function") {
			let piece;
			try {
				piece = copy(selector(this.stateTree));
			} catch (_) {}

			return piece;
		}

		return Object.assign({}, this.stateTree);
	};

	/**
	 * @method module:SimpleSharedState.Store#dispatch
	 *
	 * @param {string} actionName - A string to label this action, this is only used by redux devtools. Normally
	 * you won't call dispatch directly, you'll instead pass an action creators function to
	 * [#createStore]{@link module:SimpleSharedState#createStore}, which will auto-generate this value for you.
	 * @param {object|function} arg - A JavaScript object, or a function which takes state and returns a
	 * JavaScript object. The object may contain any Array or JS primitive, but must be a plain JS object ({})
	 * at the top level, otherwise dispatch will throw.
	 *
	 * @description Takes a branch (or a function which takes state and returns a branch), which is any plain
	 * JS object that represents the desired change to state.
	 *
	 * @example
	 * import { createStore } from "simple-shared-state";
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
	 * store.dispatch("ANY_LABEL_YOU_CHOOSE", {
	 *   email: "me@simplesharedstate.com",
	 * });
	 *
	 * // To increment likes:
	 * store.dispatch("ANY_LABEL_YOU_CHOOSE", (state) => ({
	 *   counters: {
	 *     likes: state.counters.likes + 1,
	 *   },
	 * }));
	 *
	 * // To delete any piece of state, use a reference to `store.deleted` as the value in the branch.
	 * // To remove `counters` from the state entirely:
	 * store.dispatch("ANY_LABEL_YOU_CHOOSE", {
	 *   counters: store.deleted,
	 * });
	 *
	 * // To update items in arrays, you can use `partialArray`:
	 * store.dispatch("ANY_LABEL_YOU_CHOOSE", {
	 *   todoList: partialArray(1, {
	 *     label: "buy oat milk (because it requires 80 times less water than almond milk)",
	 *   }),
	 * });
	 */
	dispatch(actionName, arg) {
		if (typeof actionName !== "string") throw new Error("dispatch actionName must be a string");
		if (this.dispatching) throw new Error("can't dispatch while dispatching");

		const branch = typeof arg === "function" ? arg(this.getState()) : arg;

		if (!branch || Object.getPrototypeOf(branch) !== objectPrototype) {
			throw new Error("dispatch expects plain object");
		}

		this._applyBranch(branch);

		if (this.devtool) this.devtool.send(actionName, this.getState());
	};
};

/**
 * @function module:SimpleSharedState#partialArray
 * @description This is a helper for making partial arrays from a one-liner. A partial array is
 * used to update a single element in an array.
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
 *
 * @example
 * import { createStore, partialArray } from "simple-shared-state";
 *
 * const initialState = {
 *   list: [
 *     { text: "some text" },
 *     { text: "some more text" },
 *     { text: "far too much text" },
 *   ],
 * };
 *
 * const actions = () => ({
 *   tableFlip: () => ({
 *     list: partialArray(1, {
 *       text: "(╯°□°)╯︵ ┻━┻",
 *     },
 *   }),
 * });
 *
 * const store = createStore(initialState, actions);
 *
 * console.log(store.getState());
 * // { list:
 * //   [ { text: 'some text' },
 * //     { text: 'some more text' },
 * //     { text: 'far too much text' } ] }
 *
 * store.actions.tableFlip();
 *
 * console.log(store.getState());
 * // { list:
 * //   [ { text: 'some text' },
 * //     { text: '(╯°□°)╯︵ ┻━┻' },
 * //     { text: 'far too much text' } ] }
 */
export const partialArray = (pos, thing) => new PartialArray(pos, thing);

function copy(thing) {
	return !thing || typeof thing !== "object" ? thing : Object.assign(isArray(thing) ? [] : {}, thing);
}
