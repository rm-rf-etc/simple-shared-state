import * as redux from "redux";
const bundles = {
	esm: require("../src/index"),
	es5: require("../dist/simple-shared-state.es5.umd"),
	es6: require("../dist/simple-shared-state.es6.umd"),
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
		const store = bundle.createStore({
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
				store.dispatch("", {
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

	describe("simpleMerge", () => {
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
			expect(bundle.simpleMerge(array, changes)).toEqual(expected);
			expect(array).toEqual(expected);
		});

		it("can update simple values in objects in arrays", () => {
			const change = {
				a: bundle.partialArray(1, { thing: 3 }),
			};
			expect(change.a[1].thing).toEqual(3);
			expect(target.a[1].thing).toEqual(2);

			bundle.simpleMerge(state, change);
			expect(state.a[1].thing).toEqual(3);
		});

		it("can change simple values to other data types inside nested objects", () => {
			bundle.simpleMerge(state, {
				b: {
					bool: "true",
				},
			});
			expect(state.b.bool).toEqual("true");
		});

		it("can replace simple values in arrays with new objects", () => {
			bundle.simpleMerge(state, {
				a: bundle.partialArray(1, {
					thing: {
						new_thing: 1,
					},
				}),
			});
			expect(state.a[1].thing).toEqual({ new_thing: 1 });
		});

		it("can append new items to arrays", () => {
			bundle.simpleMerge(state, {
				a: bundle.partialArray(2, {
					thing: "was added",
				}),
			});
			expect(state.a[2]).toEqual({ thing: "was added" });
		});

		it("doesn't fail on null values", () => {
			bundle.simpleMerge(state, {
				a: bundle.partialArray(1, null),
			});
			expect(state.a[1]).toEqual(null);
		});

		it("doesn't fail for values of 0", () => {
			bundle.simpleMerge(state, {
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

	describe("Store", () => {
		let store = {};

		beforeEach(() => {
			store = bundle.createStore({
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
				count: 1,
			}, (store) => ({
				increment: () => ({
					count: store.getState(s => s.count) + 1,
				}),
			}));
		});

		it("creates actions from provided function and passing in reference to store", () => {
			const spy = jest.fn();
			store.watch((state) => state.count, spy);
			store.actions.increment();
			expect(spy.mock.calls).toEqual([[2]]);
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
				store.watch((state) => state.count, spy);

				const increment = () => {
					store.dispatch("", (state) => ({ count: state.count + 1 }));
				};

				for (let i=0; i<8; i++) increment();
				store.dispatch("", { count: 0 });

				expect(spy.mock.calls).toEqual([ [2], [3], [4], [5], [6], [7], [8], [9], [0] ]);
			});
		});

		describe("watch", () => {
			it("dispatch works with values counting down to zero and up from below zero", () => {
				/*
				 * This addresses a specific bug that I found while developing `useSimpleSharedState`.
				 */
				const spy = jest.fn();
				store.watch((state) => state.count, spy);

				store.dispatch("", { count: 2 });
				store.dispatch("", { count: 1 });
				store.dispatch("", { count: 0 });
				store.dispatch("", { count: -1 });
				store.dispatch("", { count: -2 });
				store.dispatch("", { count: -1 });
				store.dispatch("", { count: -0 });
				store.dispatch("", { count: 1 });
				store.dispatch("", { count: 2 });
				expect(spy.mock.calls).toEqual([ [2], [1], [0], [-1], [-2], [-1], [-0], [1], [2] ]);
			});

			it("dispatch invokes listeners", () => {
				const spy1 = jest.fn();
				const spy2 = jest.fn();
				store.watch((state) => state.friends[1].name, spy1);
				store.watch((state) => state.friends[1].name, spy2);
				store.dispatch("", {
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
				store.watch((state) => state.friends, spy1);
				store.watch((state) => state.friends[1], spy2);
				store.watch((state) => state.friends[1].name, spy3);
				store.dispatch("", {
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
				const unwatch = store.watch((state) => state.friends, spy);

				store.dispatch("", {
					friends: {
						"1": {
							name: "Jim",
							age: 31,
						},
					},
				});

				expect(spy.mock.calls.length).toEqual(1);

				unwatch();

				store.dispatch("", {
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
					store.watch(selector, () => {});
					store.watch(selector, () => {});
				}).toThrow();

				expect(typeof store.watch((state) => state.friends[1], () => {})).toEqual("function");
				expect(typeof store.watch((state) => state.friends[1], () => {})).toEqual("function");
			});
		});

		describe("watchDispatch", () => {
			it("can watch & unwatch dispatch events", () => {
				const spy = jest.fn();
				const unwatch = store.watchDispatch(spy);

				store.dispatch("", {
					friends: {
						"1": {
							name: "Jim",
						},
					},
				});
				expect(spy.mock.calls.length).toEqual(1);

				store.dispatch("", {
					friends: {
						"1": {
							name: "Jessica",
						},
					},
				});
				expect(spy.mock.calls.length).toEqual(2);

				unwatch();

				store.dispatch("", {
					friends: {
						"1": {
							name: "Willard",
						},
					},
				});
				expect(spy.mock.calls.length).toEqual(2);
			});
		});

		describe("dispatch with `deleted`", () => {
			it("can remove items from arrays", () => {
				const spy1 = jest.fn();
				store.watch((state) => state.friends, spy1);
				store.dispatch("", {
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

				store.dispatch("", { friends: bundle.deleted });
				expect(store.getState().hasOwnProperty("friends")).toEqual(false);
			});

			it("can remove items from objects", () => {
				const spy1 = jest.fn();
				const spy2 = jest.fn();
				store.watch((state) => state.friends, spy1);
				store.watch((state) => state.friends[2].age, spy2);
				store.dispatch("", {
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

				store.dispatch("", {
					friends: {
						"2": {
							age: bundle.deleted,
						},
					},
				});
				store.dispatch("", {
					friends: {
						"2": bundle.deleted,
					},
				});

				// spy2 should have only been called once
				expect(spy2.mock.calls).toEqual([[undefined]]);

				store.dispatch("", {
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
				store.watch((state) => state.friends[1].name, spy);
				store.dispatch("", {
					friends: {
						"1": {
							name: "Howard",
						},
					},
				});
				expect(spy.mock.calls).toEqual([["Howard"]]);

				store.dispatch("", {
					friends: {
						"1": bundle.deleted,
					},
				});

				expect(spy.mock.calls).toEqual([
					["Howard"],
					[undefined],
				]);

				store.dispatch("", {
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
				store.dispatch("", {
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
				store.dispatch("", {
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

				store.dispatch("", {
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

				store.dispatch("", {
					friends: {
						"1": {
							name: "Susan",
						},
					},
				});
				store.dispatch("", {
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
				store.dispatch("", {
					friends: {
						"1": {
							name: "Josh",
						},
					},
				});
				store.dispatch("", {
					friends: {
						"3": {
							name: "Ronald",
							age: 5,
						},
					},
				});
				store.dispatch("", {
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

describe("Source", () => testBundle(bundles.esm));
describe("ES6", () => testBundle(bundles.es6));
describe("ES5", () => testBundle(bundles.es5));
