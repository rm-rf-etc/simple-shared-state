import * as redux from "redux";
import { Reducer, Action } from "redux";
import { Merge } from "../src/types";
import * as esm from "../src/index";
import { StoreConstructor } from "../src/index";

type StoreType = InstanceType<StoreConstructor>;
// resort to using require syntax to allow for relative import of
// a UMD module
const es5 = require("../dist/simple-shared-state.es5.umd");
const es6 = require("../dist/simple-shared-state.es6.umd");
type ESMBundle = typeof esm;
type ES5Bundle = typeof es5;
type ES6Bundle = typeof es6;
const bundles = {
	esm,
	es5,
	es6,
	esm_merge: require("../src/merge").merge,
	es6_merge: require("../test_bundle/merge").merge,
};

const _100_000 = 100000;
const _50_000_000 = 50000000;
const _100_000_000 = 100000000;

function testRawJSPerformance(times: number) {
	describe.skip(`JS Performance over ${(times).toLocaleString()} repetitions`, () => {
		const actionType = "SOME_ACTION_TYPE";
		let string = "?";
		let num: number;
		const state = {
			some_prop: {
				correct_path: 1,
			},
		};
		let intrvl = setInterval(() => {
			string = Math.random().toString().split(".")[1];
		}, 0);
		it(`time required to compare strings ${(times).toLocaleString()} times`, () => {
			for (let i = 0; i < times; i++) {
				if (string === actionType) {
					num = i;
				}
			}
			expect(num).toEqual(undefined);
		});
		it(`time required to lookup object properties ${(times).toLocaleString()} times`, () => {
			for (let i = 0; i < times; i++) {
				try {
					num = (state as any).some_prop[string];
				} catch (_) {}
			}
			expect(num).toEqual(undefined);
		});
		it(`time required to lookup object properties ${(times).toLocaleString()} times`, () => {
			for (let i = 0; i < times; i++) {
				try {
					num = (state as any).some_prop.correct_path;
				} catch (_) {}
			}
			expect(num).toEqual(1);
		});
		afterAll(() => clearInterval(intrvl));
	});
}
testRawJSPerformance(_100_000);
testRawJSPerformance(_50_000_000);
testRawJSPerformance(_100_000_000);

type ReduxState = { [k: string]: any };
const defaultAction = {
	value: 0,
	type: "",
};
describe("Redux Performance", () => {
	const reducer: Reducer<ReduxState, Action<string> & typeof defaultAction> = (
		oldState = { thing1: 1 },
		action = defaultAction,
	) => {
		return {
			...oldState,
			a: {
				thing1: (action.value || 0) + 1,
				thing2: -((action.value || 0) + 1),
			},
		};
	};
	const store = redux.createStore(reducer, {
		a: {
			thing1: 1,
			thing2: -1,
			thing3: "ignored",
		},
		b: {
			ignored: "asdf",
		},
	});

	it(`run dispatch ${(_100_000).toLocaleString()} times`, (done) => {
		store.subscribe(() => {
			const state = store.getState();
			if (state && state.a.thing1 === _100_000) done();
		});
		for (var i = 0; i < _100_000; i++) {
			store.dispatch({ type: "A", value: i });
		}
	});
});

function testBundle(bundle: ESMBundle | ES5Bundle | ES6Bundle) {
	const Store = bundle.Store;
	const deleted = bundle.deleted;

	describe("SimpleSharedState Performance", () => {
		const initialState = {
			a: [
				{
					thing1: 1,
					thing2: -1,
					thing3: "ignored",
				},
			],
			b: {
				ignored: "asdf",
			},
		};
		type InitialState = typeof initialState;
		const store = new Store(initialState);

		it(`run dispatch ${(_100_000).toLocaleString()} times`, (done) => {
			store.watch((state: InitialState) => state.a[0], (state: InitialState["a"][0]) => {
				if (state.thing1 === _100_000) {
					done();
				}
			});
			for (var i = 0; i < _100_000; i++) {
				store.dispatch({
					a: [
						{
							thing1: i+1,
							thing2: -(i+1),
						},
					],
				});
			}
		});
	});

	describe("Store", () => {
		let store: StoreType;

		const initialState = {
			friends: {
				"1": {
					name: "Alice",
					age: 25,
				},
				"2": {
					name: "Bob",
					age: 28,
				},
			},
			emptyArray: ([] as any[]),
			todos: [
				{ id: 1, label: "buy oat milk" },
				{ id: 2, label: "buy cat food" },
			],
			count: 1,
		};
		type InitialState = typeof initialState;

		beforeEach(() => {
			store = new Store(initialState, (getState: (fn: (s: InitialState) => any) => any) => ({
				increment: () => ({
					count: getState(s => s.count) + 1,
				}),
				decrement: () => (state: InitialState) => ({
					count: state.count - 1,
				}),
				replaceTodos: () => ({
					todos: [ true, "false" ],
				}),
			}));
		});

		it("creates actions from provided function and passes reference to store", () => {
			const spy = jest.fn();
			store.watch((state: InitialState) => state.count, spy, false);
			store.actions.increment();
			expect(spy.mock.calls).toEqual([[2]]);
		});

		it("actions that return a function will call the function and receive state", () => {
			const spy = jest.fn();
			store.watch((state: InitialState) => state.count, spy, false);
			store.actions.decrement();
			expect(spy.mock.calls).toEqual([[0]]);
		});

		describe("getState", () => {
			it("uses optional selector function or returns entire state copy", () => {
				let state = store.getState();
				const expectedState = {
					friends: {
						"1": {
							name: "Alice",
							age: 25,
						},
						"2": {
							name: "Bob",
							age: 28,
						},
					},
					emptyArray: ([] as any[]),
					todos: [
						{ id: 1, label: "buy oat milk" },
						{ id: 2, label: "buy cat food" },
					],
					count: 1,
				};
				expect(state).toEqual(expectedState);
				state = null;
				expect(state).toEqual(null);
				expect(store.getState()).toEqual(expectedState);
				expect(store.getState(s => s.friends)).toEqual({
					"1": {
						name: "Alice",
						age: 25,
					},
					"2": {
						name: "Bob",
						age: 28,
					},
				});
				let friends = store.getState(s => s.friends);
				friends = null;
				expect(friends).toEqual(null);
				expect(store.getState((s: InitialState) => s.friends[1])).toEqual({
					name: "Alice",
					age: 25,
				});
			});
		});

		describe("dispatch", () => {
			it("provides copy of state if called with a function", () => {
				const spy = jest.fn();
				store.watch((state: InitialState) => state.count, spy, false);

				const increment = () => {
					store.dispatch((state: InitialState) => ({ count: state.count + 1 }));
				};

				for (let i=0; i<8; i++) increment();
				store.dispatch({ count: 0 });

				expect(spy.mock.calls).toEqual([ [2], [3], [4], [5], [6], [7], [8], [9], [0] ]);
			});

			it("handles large objects of numbered props", () => {
				const store = new Store({
					colors: [
						{ r:0, g:0, b:0 },
					],
				});
				const colors = {
					"0": {
						"r": 48,
						"g": 173,
						"b": 3
					},
					"1": {
						"r": 216,
						"g": 229,
						"b": 123
					},
					"2": {
						"r": 255,
						"g": 36,
						"b": 245
					},
					"3": {
						"r": 88,
						"g": 89,
						"b": 131
					},
				};
				store.dispatch({ colors });
				expect(store.stateTree).toEqual({
					colors: [
						{ "r": 48, "g": 173, "b": 3 },
						{ "r": 216, "g": 229, "b": 123 },
						{ "r": 255, "g": 36, "b": 245 },
						{ "r": 88, "g": 89, "b": 131 },
					],
				});
			});
		});

		describe("watch", () => {
			it("dispatch works with values counting down to zero and up from below zero", () => {
				/*
				 * This addresses a specific bug that I found while developing `useSimpleSharedState`.
				 */
				const spy = jest.fn();
				store.watch((state: InitialState) => state.count, spy, false);

				store.dispatch({ count: 2 });
				store.dispatch({ count: 1 });
				store.dispatch({ count: 0 });
				store.dispatch({ count: -1 });
				store.dispatch({ count: -2 });
				store.dispatch({ count: -1 });
				store.dispatch({ count: -0 });
				store.dispatch({ count: 1 });
				store.dispatch({ count: 2 });
				expect(spy.mock.calls).toEqual([ [2], [1], [0], [-1], [-2], [-1], [-0], [1], [2] ]);
			});

			it("watch calls handler immediately unless false is provided as 3rd arg", () => {
				const spy1 = jest.fn();
				const spy2 = jest.fn();
				store.watch((state: InitialState) => state.count, spy1, false);
				store.watch((state: InitialState) => state.count, spy2);
				expect(spy1.mock.calls.length).toEqual(0);
				expect(spy2.mock.calls.length).toEqual(1);
				expect(spy2.mock.calls[0]).toEqual([1]);
			});

			it("watch selectors work for empty arrays", () => {
				const spy = jest.fn();
				store.watchBatch([
					(state: InitialState) => state.emptyArray,
					(state: InitialState) => state.count,
				], spy);
				expect(spy.mock.calls.length).toEqual(1);
				expect(spy.mock.calls[0]).toEqual([[[], 1]]);
			});

			it("dispatch invokes listeners", () => {
				const spy1 = jest.fn();
				const spy2 = jest.fn();
				store.watch((state: InitialState) => state.friends[1].name, spy1, false);
				store.watch((state: InitialState) => state.friends[1].name, spy2, false);
				store.dispatch({
					friends: {
						"1": {
							name: "Carrol",
						},
					},
				});
				expect(spy1).toHaveBeenCalled();
				expect(spy2).toHaveBeenCalled();
			});

			it("emits nested objects for selectors having a partial path", () => {
				const spy1 = jest.fn();
				const spy2 = jest.fn();
				const spy3 = jest.fn();
				store.watch((state: InitialState) => state.friends, spy1, false);
				store.watch((state: InitialState) => state.friends[1], spy2, false);
				store.watch((state: InitialState) => state.friends[1].name, spy3, false);
				store.dispatch({
					friends: {
						"1": {
							name: "Carrol",
						},
					},
				});
				expect(spy1.mock.calls).toEqual([[{
					"1": {
						name: "Carrol",
						age: 25,
					},
					"2": {
						name: "Bob",
						age: 28,
					},
				}]]);
				expect(spy2.mock.calls).toEqual([[{
					name: "Carrol",
					age: 25,
				}]]);
				expect(spy3.mock.calls).toEqual([[
					"Carrol",
				]]);
			});

			it("unwatch removes watch listeners", () => {
				const spy = jest.fn();
				const unwatch = store.watch((state: InitialState) => state.friends, spy, false);

				store.dispatch({
					friends: {
						"1": {
							name: "Jim",
							age: 31,
						},
					},
				});

				expect(spy.mock.calls.length).toEqual(1);

				unwatch();

				store.dispatch({
					friends: {
						"2": {
							name: "Peter",
						},
					},
				});

				// has been called once more
				expect(spy.mock.calls.length).toEqual(1);
			});

			it("should throw when attempting to reuse existing selector", () => {
				const selector = (state: InitialState) => state.friends[1];

				expect(() => {
					store.watch(selector, () => {}, false);
					store.watch(selector, () => {}, false);
				}).toThrow();

				expect(typeof store.watch((state: InitialState) => state.friends[1], () => {}, false))
				.toEqual("function");
				expect(typeof store.watch((state: InitialState) => state.friends[1], () => {}, false))
				.toEqual("function");
			});
		});

		describe("watchDispatch", () => {
			it("can watch & unwatch dispatch events", () => {
				const spy = jest.fn();
				const unwatch = store.watchDispatch(spy);

				store.dispatch({
					friends: {
						"1": {
							name: "Jim",
						},
					},
				});
				expect(spy.mock.calls.length).toEqual(1);

				store.dispatch({
					friends: {
						"1": {
							name: "Jessica",
						},
					},
				});
				expect(spy.mock.calls.length).toEqual(2);

				unwatch();

				store.dispatch({
					friends: {
						"1": {
							name: "Willard",
						},
					},
				});
				expect(spy.mock.calls.length).toEqual(2);
			});
		});

		describe("dispatch with complete arrays", () => {
			it("replaces old array with new ones", () => {
				const spy = jest.fn();
				expect(store.getState(s => s.todos)).toEqual([
					{ id: 1, label: "buy oat milk" },
					{ id: 2, label: "buy cat food" },
				]);
				store.watch((state: InitialState) => state.todos, spy, false);

				store.actions.replaceTodos();
				expect(store.getState(s => s.todos)).toEqual([ true, "false" ]);
				expect(store.getState(s => s.friends)).toEqual({
					"1": {
						name: "Alice",
						age: 25,
					},
					"2": {
						name: "Bob",
						age: 28,
					},
				});
				expect(store.getState(s => s.emptyArray)).toEqual([]);

				expect(spy.mock.calls.length).toEqual(1);
				expect(spy.mock.calls[0]).toEqual([[ true, "false" ]]);
			});
		});

		describe("dispatch with `deleted`", () => {
			it("can remove items from arrays", () => {
				const spy1 = jest.fn();
				store.watch((state: InitialState) => state.friends, spy1, false);
				store.dispatch({
					friends: {
						"1": undefined,
						"2": deleted,
					},
				});
				expect(spy1.mock.calls).toEqual([[{
					"1": undefined,
				}]]);
				expect(store.getState().friends.hasOwnProperty("1")).toEqual(true);
				expect(store.getState().friends.hasOwnProperty("2")).toEqual(false);

				store.dispatch({ friends: deleted });
				expect(store.getState().hasOwnProperty("friends")).toEqual(false);
			});

			it("can remove items from objects", () => {
				const spy1 = jest.fn();
				const spy2 = jest.fn();
				store.watch((state: InitialState) => state.friends, spy1, false);
				store.watch((state: InitialState) => state.friends[2].age, spy2, false);
				store.dispatch({
					friends: {
						"1": {
							name: "Susan",
							age: undefined, // age will remain in state with value `undefined`
						},
						"2": {
							age: deleted, // age will be removed from state
						},
					},
				});
				expect(spy1.mock.calls).toEqual([[{
					"1": {
						name: "Susan",
						age: undefined,
					},
					"2": {
						name: "Bob",
					},
				}]]);

				// spy2 should have only been called once
				expect(spy2.mock.calls).toEqual([[undefined]]);

				expect(store.getState().friends[1]).toEqual({ name: "Susan" });
				expect(store.getState().friends[1].hasOwnProperty("age")).toEqual(true); // proof it remains

				expect(store.getState().friends[2]).toEqual({ name: "Bob" });
				expect(store.getState().friends[2].hasOwnProperty("age")).toEqual(false); // proof it was removed

				store.dispatch({
					friends: {
						"2": {
							age: deleted,
						},
					},
				});
				store.dispatch({
					friends: {
						"2": deleted,
					},
				});

				// spy2 should have only been called once
				expect(spy2.mock.calls).toEqual([[undefined]]);

				store.dispatch({
					friends: {
						"2": {
							name: "Jorge",
							age: 41,
						},
					},
				});


				// spy2 should have only been called once
				expect(spy2.mock.calls).toEqual([[undefined], [41]]);
			});

			it("watchers receive `undefined` when state is deleted", () => {
				const spy = jest.fn();
				store.watch((state: InitialState) => state.friends[1].name, spy, false);
				store.dispatch({
					friends: {
						"1": {
							name: "Howard",
						},
					},
				});
				expect(spy.mock.calls[0]).toEqual(["Howard"]);

				store.dispatch({
					friends: {
						"1": deleted,
					},
				});

				expect(spy.mock.calls[1]).toEqual([undefined]);

				store.dispatch({
					friends: {
						"1": {
							name: "Matt",
							age: 35,
						},
					},
				});

				expect(spy.mock.calls).toEqual([
					["Howard"],
					[undefined],
					["Matt"],
				]);

				// testing that this call doesn't trigger the watcher
				store.dispatch({
					friends: {
						"1": {
							age: 34,
						},
					},
				});
				expect(spy.mock.calls).toEqual([
					["Howard"],
					[undefined],
					["Matt"],
				]);
			});
		});

		describe("watchBatch", () => {
			it("array.slice(0, -1) removes the last element from an array in state", () => {
				const spy = jest.fn();
				store.watchBatch([
					(state: InitialState) => state.friends[1],
					(state: InitialState) => state.count,
					(state: InitialState) => state.todos,
				], spy);

				expect(spy.mock.calls[0]).toEqual([
					[
						{ age: 25, name: "Alice" },
						1,
						[
							{ id: 1, label: "buy oat milk" },
							{ id: 2, label: "buy cat food" },
						],
					]
				]);

				store.dispatch((state: InitialState) => ({ todos: state.todos.slice(0, -1) }));

				expect(spy.mock.calls[1]).toEqual([
					[
						{ age: 25, name: "Alice" },
						1,
						[
							{ id: 1, label: "buy oat milk" },
						],
					]
				]);

				expect(store.getState().todos).toEqual([
					{ id: 1, label: "buy oat milk" },
				]);
			});

			it("array.slice(1) removes the first element from an array in state", () => {
				const spy = jest.fn();
				store.watchBatch([
					(state: InitialState) => state.friends[1],
					(state: InitialState) => state.count,
					(state: InitialState) => state.todos,
				], spy);

				expect(spy.mock.calls[0]).toEqual([
					[
						{ age: 25, name: "Alice" },
						1,
						[
							{ id: 1, label: "buy oat milk" },
							{ id: 2, label: "buy cat food" },
						],
					]
				]);

				store.dispatch((state: InitialState) => ({ todos: state.todos.slice(1) }));

				expect(spy.mock.calls[1]).toEqual([
					[
						{ age: 25, name: "Alice" },
						1,
						[
							{ id: 2, label: "buy cat food" },
						],
					]
				]);

				expect(store.getState().todos).toEqual([
					{ id: 2, label: "buy cat food" },
				]);
			});

			it("is called only once for a list of selectors", () => {
				const spy = jest.fn();
				const removeWatcher = store.watchBatch([
					(state: InitialState) => state.friends[1].age,
					(state: InitialState) => state.friends[1].name,
					(state: InitialState) => state.friends[2].age,
					(state: InitialState) => state.friends[2].name,
				], spy);
				expect(spy.mock.calls.length).toEqual(1);
				expect(spy.mock.calls).toEqual([[[25, "Alice", 28, "Bob"]]]);
				store.dispatch({
					friends: {
						"1": {
							name: "Will",
						},
						"2": {
							age: 56,
						},
					},
				});
				expect(spy.mock.calls.length).toEqual(2);
				expect(spy.mock.calls).toEqual([
					[[25, "Alice", 28, "Bob"]],
					[[25, "Will", 56, "Bob"]],
				]);

				// verify that we can remove the watcher
				removeWatcher();

				store.dispatch({
					friends: {
						"1": {
							age: 29,
						},
					},
				});
				expect(spy.mock.calls.length).toEqual(2);
			});

			it("is not called repeatedly for inapplicable selectors", () => {
				const spy = jest.fn();
				store.watchBatch([
					(s: any): any => s.something,
					(s: any): any => s.nothing.here,
					(s: any): any => s.none.state.here,
				], spy);

				store.dispatch({
					friends: {
						"1": {
							name: "Susan",
						},
					},
				});
				store.dispatch({
					friends: {
						"1": {
							age: 26,
						},
					},
				});

				expect(spy.mock.calls.length).toEqual(1);
				expect(spy.mock.calls).toEqual([[
					[undefined, undefined, undefined],
				]]);
			});
		});

		describe("erroneous selectors", () => {
			it("does not spam the listener with `undefined` on every dispatch event", () => {
				const spy = jest.fn();
				store.watch((state: any) => state.not.valid.selector, spy);
				store.dispatch({
					friends: {
						"1": {
							name: "Josh",
						},
					},
				});
				store.dispatch({
					friends: {
						"3": {
							name: "Ronald",
							age: 5,
						},
					},
				});
				store.dispatch({
					friends: {
						"1": {
							age: 41,
						},
						"2": {
							age: 7,
						},
					},
				});
				expect(spy.mock.calls.length).toEqual(0);
			});
		});
	});
}

const target = {
	a: [
		{ thing: 1 },
		{ thing: 2 },
	],
	b: {
		asdf1: "!",
		asdf2: 0,
		bool: false,
	},
};
type Target = typeof target;
function testMerge(merge: (a: any, b: any) => Merge<Target, any>) {
	describe("merge", () => {
		let state: Target;

		beforeEach(() => {
			state = { ...target };
		});

		it("correctly merges partial arrays", () => {
			const array = { a: [1, 2, 3, 4, 5] };
			const changes = {
				a: {
					"1": "change1",
					"3": "change2",
				},
			};

			const expected = {
				a: [1, "change1", 3, "change2", 5],
			};
			expect(merge(array, changes)).toEqual(expected);
			expect(array).toEqual({ a: [1, 2, 3, 4, 5] });
		});

		it("can update simple values in objects in arrays", () => {
			const change = {
				a: {
					"1": {
						thing: 3,
					},
				},
			};
			expect(Array.isArray(change.a)).toEqual(false);
			expect(change.a[1].thing).toEqual(3);
			expect(target.a[1].thing).toEqual(2);

			const result = merge(state, change);
			expect(result.a[1].thing).toEqual(3);
			expect(Array.isArray(result.a)).toEqual(true);
			expect(JSON.stringify(result.a)).toEqual('[{"thing":1},{"thing":3}]');
		});

		it("can change simple values to other data types inside nested objects", () => {
			const result = merge(state, {
				b: {
					bool: "true",
				},
			});
			expect(result.b.bool).toEqual("true");
		});

		it("can replace simple values in arrays with new objects", () => {
			const result = merge(state, {
				a: {
					"1": {
						thing: {
							new_thing: 1,
						},
					},
				},
			});
			expect(result.a[1].thing).toEqual({ new_thing: 1 });
		});

		it("can append new items to arrays", () => {
			const result = merge(state, {
				a: {
					"2": {
						thing: "was added",
					},
				},
			});
			expect(result.a[2]).toEqual({ thing: "was added" });
		});

		it("doesn't fail on null values", () => {
			const result = merge(state, {
				a: {
					"1": null,
				},
			});
			expect(result.a[1]).toEqual(null);
		});

		it("doesn't fail for values of 0", () => {
			const result = merge(state, {
				a: 0,
				b: {
					asdf1: 0,
					asdf2: {
						stuff: "stuff",
					},
				},
			});
			expect(result.a).toEqual(0);
			expect(result.b.asdf1).toEqual(0);
			expect(result.b.asdf2).toEqual({ stuff: "stuff" });
		});
	});
}

describe("Source", () => {
	testBundle(bundles.esm);
	testMerge(bundles.esm_merge);
});
describe("ES6", () => {
	testBundle(bundles.es6);
	testMerge(bundles.es6_merge);
});
describe("ES5", () => {
	testBundle(bundles.es5);
});
