import * as redux from "redux";
const sss = require("../src/index");
const sssES5 = require("../dist/simple-shared-state.es5.umd");
const sssES6 = require("../dist/simple-shared-state.es6.umd");

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

describe("SimpleSharedState Performance", () => {
	let store = sss.createStore({
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

function testBundle(bundle) {
	describe("createStore", () => {
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
				}
			});
		});

		it("dispatch invokes listeners", () => {
			const spy1 = jest.fn();
			const spy2 = jest.fn();
			store.watch((state) => state.friends["1"].name, spy1);
			store.watch((state) => state.friends["1"].name, spy2);
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
			store.watch((state) => state.friends, spy1);
			store.watch((state) => state.friends["1"], spy2);
			store.watch((state) => state.friends["1"].name, spy3);
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

		it("can watch & unwatch dispatch events", () => {
			const spy1 = jest.fn();
			const spy2 = jest.fn();
			const spy3 = jest.fn();
			const spy4 = jest.fn();
			const spy5 = jest.fn();
			const spy6 = jest.fn();
			const friendsSelector = (state) => state.friends;
			store.watch((state) => state.friends[1].name, spy1);
			store.watch((state) => state.friends[1].age, spy2);
			store.watch((state) => state.friends[2].name, spy3);
			store.watch((state) => state.friends[2].age, spy4);
			store.watch(friendsSelector, spy5);
			store.watchDispatch(spy6);

			store.dispatch({
				friends: {
					"1": {
						name: "Jim",
						age: 31,
					},
					"2": {
						name: "Jake",
						age: 23,
					},
				},
			});

			expect(spy1.mock.calls).toEqual([["Jim"]]);
			expect(spy2.mock.calls).toEqual([[31]]);
			expect(spy3.mock.calls).toEqual([["Jake"]]);
			expect(spy4.mock.calls).toEqual([[23]]);
			expect(spy5.mock.calls).toEqual([[{
				"1": {
					name: "Jim",
					age: 31,
				},
				"2": {
					name: "Jake",
					age: 23,
				},
			}]]);
			expect(spy6.mock.calls).toEqual([[]]);

			store.unwatchDispatch(spy6);
			// call a 2nd time to verify it doesn't throw
			store.unwatchDispatch(spy6);

			// we can't use spy5 anymore because references to objects from past calls
			// will show the current state, therefore spy5.mock.calls will be wrong.
			store.unwatch(friendsSelector);
			const spy7 = jest.fn();
			store.watch(friendsSelector, spy7);

			store.dispatch({
				friends: {
					"1": {
						name: "Peter",
					},
				},
			});

			// has been called once more
			expect(spy1.mock.calls).toEqual([["Jim"], ["Peter"]]);
			expect(spy7.mock.calls).toEqual([[{
				"1": {
					name: "Peter",
					age: 31,
				},
				"2": {
					name: "Jake",
					age: 23,
				},
			}]]);

			// has not been called again
			expect(spy2.mock.calls).toEqual([[31]]);
			expect(spy3.mock.calls).toEqual([["Jake"]]);
			expect(spy4.mock.calls).toEqual([[23]]);
			expect(spy6.mock.calls).toEqual([[]]);
		});

		it("should throw when attempting to reuse existing selector", () => {
			const selector = (state) => state.friends["1"];

			expect(() => {
				store.watch(selector, console.log);
				store.watch(selector, console.log);
			}).toThrow();

			expect(store.watch((state) => state.friends["1"], console.log)).toEqual({
				name: "Alice",
				age: 25,
			});
			expect(store.watch((state) => state.friends["1"], console.log)).toEqual({
				name: "Alice",
				age: 25,
			});
		});

		it("can unwatch previously watched", () => {
			const spy1 = jest.fn();
			const selector = (state) => state.friends["1"].name;
			store.watch(selector, spy1);
			store.dispatch({
				friends: {
					"1": {
						name: "Carrol",
					},
				},
			});
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
						name: "Dianne",
					},
				},
			});
			store.unwatch(selector, spy1);
			store.dispatch({
				friends: {
					"1": {
						name: "Edward",
					},
				},
			});
			expect(spy1.mock.calls).toEqual([
				["Carrol"],
				["Susan"],
				["Dianne"],
			]);
		});

		it("can remove items from arrays", () => {
			const spy1 = jest.fn();
			store.watch((state) => state.friends, spy1);
			store.dispatch({
				friends: {
					"1": {
						name: "Susan",
						age: 25,
					},
					"2": bundle.deleted,
				},
			});
			expect(spy1.mock.calls).toEqual([[{
				"1": {
					name: "Susan",
					age: 25,
				},
			}]]);
			expect(store.getState().friends["2"]).toEqual(undefined);
		});

		it("can remove items from objects", () => {
			const spy1 = jest.fn();
			store.watch((state) => state.friends, spy1);
			store.dispatch({
				friends: {
					"1": {
						name: "Susan",
						age: bundle.deleted,
					},
					"2": {
						age: bundle.deleted,
					},
				},
			});
			expect(spy1.mock.calls).toEqual([[{
				"1": {
					name: "Susan",
				},
				"2": {
					name: "Bob",
				},
			}]]);
			expect(store.getState().friends["1"]).toEqual({
				name: "Susan",
			});
			expect(store.getState().friends["2"]).toEqual({
				name: "Bob",
			});
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
}

describe("raw source code", () => {
	testBundle(sss);
});
describe("ES6", () => {
	testBundle(sssES6);
});
describe("ES5", () => {
	testBundle(sssES5);
});
