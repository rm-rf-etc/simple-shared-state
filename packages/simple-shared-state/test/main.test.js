import * as redux from "redux";
const bundles = {
	esm: require("../src/index"),
	es5: require("../dist/simple-shared-state.es5.umd"),
	es6: require("../dist/simple-shared-state.es6.umd"),
	esm_merge: require("../src/merge").merge,
	es6_merge: require("../test_bundle/merge").merge,
};

const _100_000 = 100000;
const _50_000_000 = 50000000;
const _100_000_000 = 100000000;

function testRawJSPerformance(times) {
	describe.skip(`JS Performance over ${(times).toLocaleString()} repetitions`, () => {
		const actionType = "SOME_ACTION_TYPE";
		let string = "?";
		let intrvl;
		let num;
		const state = {
			some_prop: {
				correct_path: 1,
			},
		};
		intrvl = setInterval(() => {
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
					num = state.some_prop[string];
				} catch (_) {}
			}
			expect(num).toEqual(undefined);
		});
		it(`time required to lookup object properties ${(times).toLocaleString()} times`, () => {
			for (let i = 0; i < times; i++) {
				try {
					num = state.some_prop.correct_path;
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

describe("Redux Performance", () => {
	const reducer = (oldState = { thing1: 1 }, action = {}) => {
		return {
			...oldState,
			a: {
				thing1: action.value + 1,
				thing2: -(action.value + 1),
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

function testBundle(bundle) {

	describe("SimpleSharedState Performance", () => {
		const store = new bundle.Store({
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
		});

		it(`run dispatch ${(_100_000).toLocaleString()} times`, (done) => {
			store.watch((state) => state.a[0], (state) => {
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
		let store = {};

		beforeEach(() => {
			store = new bundle.Store({
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
				emptyArray: [],
				todos: [
					{ id: 1, label: "buy oat milk" },
					{ id: 2, label: "buy cat food" },
				],
				count: 1,
			}, (getState) => ({
				increment: () => ({
					count: getState(s => s.count) + 1,
				}),
				decrement: () => (state) => ({
					count: state.count - 1,
				}),
				replaceTodos: () => ({
					todos: [ true, "false" ],
				}),
			}));
		});

		it("creates actions from provided function and passes reference to store", () => {
			const spy = jest.fn();
			store.watch((state) => state.count, spy, false);
			store.actions.increment();
			expect(spy.mock.calls).toEqual([[2]]);
		});

		it("actions that return a function will call the function and receive state", () => {
			const spy = jest.fn();
			store.watch((state) => state.count, spy, false);
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
					emptyArray: [],
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
				expect(store.getState(s => s.friends[1])).toEqual({
					name: "Alice",
					age: 25,
				});
			});
		});

		describe("dispatch", () => {
			it("provides copy of state if called with a function", () => {
				const spy = jest.fn();
				store.watch((state) => state.count, spy, false);

				const increment = () => {
					store.dispatch((state) => ({ count: state.count + 1 }));
				};

				for (let i=0; i<8; i++) increment();
				store.dispatch({ count: 0 });

				expect(spy.mock.calls).toEqual([ [2], [3], [4], [5], [6], [7], [8], [9], [0] ]);
			});
		});

		describe("watch", () => {
			it("dispatch works with values counting down to zero and up from below zero", () => {
				/*
				 * This addresses a specific bug that I found while developing `useSimpleSharedState`.
				 */
				const spy = jest.fn();
				store.watch((state) => state.count, spy, false);

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
				store.watch((state) => state.count, spy1, false);
				store.watch((state) => state.count, spy2);
				expect(spy1.mock.calls.length).toEqual(0);
				expect(spy2.mock.calls.length).toEqual(1);
				expect(spy2.mock.calls[0]).toEqual([1]);
			});

			it("watch selectors work for empty arrays", () => {
				const spy = jest.fn();
				store.watchBatch([
					(state) => state.emptyArray,
					(state) => state.count,
				], spy);
				expect(spy.mock.calls.length).toEqual(1);
				expect(spy.mock.calls[0]).toEqual([[[], 1]]);
			});

			it("dispatch invokes listeners", () => {
				const spy1 = jest.fn();
				const spy2 = jest.fn();
				store.watch((state) => state.friends[1].name, spy1, false);
				store.watch((state) => state.friends[1].name, spy2, false);
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
				store.watch((state) => state.friends, spy1, false);
				store.watch((state) => state.friends[1], spy2, false);
				store.watch((state) => state.friends[1].name, spy3, false);
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
				const unwatch = store.watch((state) => state.friends, spy, false);

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
				const selector = (state) => state.friends[1];

				expect(() => {
					store.watch(selector, () => {}, false);
					store.watch(selector, () => {}, false);
				}).toThrow();

				expect(typeof store.watch((state) => state.friends[1], () => {}, false)).toEqual("function");
				expect(typeof store.watch((state) => state.friends[1], () => {}, false)).toEqual("function");
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
				store.watch((state) => state.todos, spy, false);

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
				store.watch((state) => state.friends, spy1, false);
				store.dispatch({
					friends: {
						"1": undefined,
						"2": bundle.deleted,
					},
				});
				expect(spy1.mock.calls).toEqual([[{
					"1": undefined,
				}]]);
				expect(store.getState().friends.hasOwnProperty("1")).toEqual(true);
				expect(store.getState().friends.hasOwnProperty("2")).toEqual(false);

				store.dispatch({ friends: bundle.deleted });
				expect(store.getState().hasOwnProperty("friends")).toEqual(false);
			});

			it("can remove items from objects", () => {
				const spy1 = jest.fn();
				const spy2 = jest.fn();
				store.watch((state) => state.friends, spy1, false);
				store.watch((state) => state.friends[2].age, spy2, false);
				store.dispatch({
					friends: {
						"1": {
							name: "Susan",
							age: undefined, // age will remain in state with value `undefined`
						},
						"2": {
							age: bundle.deleted, // age will be removed from state
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
							age: bundle.deleted,
						},
					},
				});
				store.dispatch({
					friends: {
						"2": bundle.deleted,
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
				store.watch((state) => state.friends[1].name, spy, false);
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
						"1": bundle.deleted,
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
			it("array.pop of a sibling array leaves adjacent properties unaffected", () => {
				const spy = jest.fn();
				store.watchBatch([
					(state) => state.friends[1],
					(state) => state.count,
					(state) => state.todos,
				], spy);

				expect(spy.mock.calls[0]).toEqual([[
					{
						age: 25,
						name: "Alice",
					},
					1,
					[
						{ id: 1, label: "buy oat milk" },
						{ id: 2, label: "buy cat food" },
					],
				]]);

				store.dispatch({ todos: [].pop });

				expect(spy.mock.calls[1]).toEqual([[
					{
						age: 25,
						name: "Alice"
					},
					1,
					[
						{ id: 1, label: "buy oat milk" },
					],
				]]);
			});

			it("is called only once for a list of selectors", () => {
				const spy = jest.fn();
				const removeWatcher = store.watchBatch([
					(state) => state.friends[1].age,
					(state) => state.friends[1].name,
					(state) => state.friends[2].age,
					(state) => state.friends[2].name,
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
					(s) => s.something,
					(s) => s.nothing.here,
					(s) => s.none.state.here,
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
				store.watch((state) => state.not.valid.selector, spy);
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

function testMerge(bundle, merge) {
	describe("merge", () => {
		let state;
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
		beforeEach(() => {
			state = { ...target };
		});

		it("correctly merges partial arrays", () => {
			const array = [1, 2, 3, 4, 5];
			const changes = [];
			changes[1] = "change1";
			changes[3] = "change2";

			const expected = [1, "change1", 3, "change2", 5];
			expect(merge(array, changes)).toEqual(expected);
			expect(array).toEqual(expected);
		});

		it("can update simple values in objects in arrays", () => {
			const change = {
				a: bundle.partialArray(1, { thing: 3 }),
			};
			expect(Array.isArray(change.a)).toEqual(false);
			expect(change.a[1].thing).toEqual(3);
			expect(target.a[1].thing).toEqual(2);

			merge(state, change);
			expect(state.a[1].thing).toEqual(3);
			expect(Array.isArray(state.a)).toEqual(true);
			expect(JSON.stringify(state.a)).toEqual('[{"thing":1},{"thing":3}]');
		});

		it("can change simple values to other data types inside nested objects", () => {
			merge(state, {
				b: {
					bool: "true",
				},
			});
			expect(state.b.bool).toEqual("true");
		});

		it("can replace simple values in arrays with new objects", () => {
			merge(state, {
				a: bundle.partialArray(1, {
					thing: {
						new_thing: 1,
					},
				}),
			});
			expect(state.a[1].thing).toEqual({ new_thing: 1 });
		});

		it("can append new items to arrays", () => {
			merge(state, {
				a: bundle.partialArray(2, {
					thing: "was added",
				}),
			});
			expect(state.a[2]).toEqual({ thing: "was added" });
		});

		it("doesn't fail on null values", () => {
			merge(state, {
				a: bundle.partialArray(1, null),
			});
			expect(state.a[1]).toEqual(null);
		});

		it("doesn't fail for values of 0", () => {
			merge(state, {
				a: 0,
				b: {
					asdf1: 0,
					asdf2: {
						stuff: "stuff",
					},
				},
			});
			expect(state.a).toEqual(0);
			expect(state.b.asdf1).toEqual(0);
			expect(state.b.asdf2).toEqual({ stuff: "stuff" });
		});
	});
}

describe("Source", () => {
	testBundle(bundles.esm);
	testMerge(bundles.esm, bundles.esm_merge);
});
describe("ES6", () => {
	testBundle(bundles.es6);
	testMerge(bundles.es6, bundles.es6_merge);
});
describe("ES5", () => {
	testBundle(bundles.es5);
});
