/* eslint-env jest */
import {
	nestFlatten,
	nestExpand,
	getPath,
	branchExpand,
} from "../nested";

/* eslint-disable quote-props */
describe("getPath", () => {
	it("makes paths of objects", () => {
		const obj = { a: { b: 1 } };
		expect(getPath(obj, null, "a")).toEqual("a");
		expect(getPath(obj.a, "a", "b")).toEqual("a.b");
	});
	it("makes paths of arrays", () => {
		const obj = { a: [1] };
		expect(getPath(obj, null, "a")).toEqual("a");
		expect(getPath(obj.a, "a", "0")).toEqual("a[0]");
	});
});
describe("branchExpand", () => {
	it("creates nested object from path", () => {
		const initial = "a.b";
		const expected = { a: { b: 1 } };
		expect(branchExpand(initial, 1)).toEqual(expected);
	});
	it("creates nested array from path", () => {
		const initial = "[0][0]";
		const expected = [[1]];
		expect(branchExpand(initial, 1)).toEqual(expected);
	});
	it("creates complex nest of objects and arrays from path", () => {
		const initial = "a[3].b[0]";
		const expected = {
			a: [
				undefined,
				undefined,
				undefined,
				{
					b: [1],
				},
			],
		};
		expect(branchExpand(initial, 1)).toEqual(expected);
	});
});
describe("nestFlatten and getPath", () => {
	it("trial 1", () => {
		const initial = {
			"x": "letter X",
			"5": "number 5",
		};
		const expected = {
			"a.x": "letter X",
			"a.5": "number 5",
		};
		expect(nestFlatten(initial, "a")).toEqual(expected);
	});
	it("trial 2", () => {
		const initial = {
			"x": "letter X",
			"5": "number 5",
			"a": {
				"x": "letter X",
				"5": "number 5",
			},
		};
		const expected = {
			"x": "letter X",
			"5": "number 5",
			"a.5": "number 5",
			"a.x": "letter X",
		};
		expect(nestFlatten(initial)).toEqual(expected);
	});
});
describe("nestFlatten", () => {
	it("flattens simple objects", () => {
		const initial = {
			"x": "letter X",
			"5": "number 5",
		};
		const expected = {
			"x": "letter X",
			"5": "number 5",
		};
		expect(nestFlatten(initial)).toEqual(expected);
	});
	it("flattens objects deeply", () => {
		const initial = {
			"x": "letter X",
			"5": 5,
			"a": {
				"b": "letter B",
				"d": {
					"e": "letter E",
				},
			},
			"1": {
				"2": "two",
				"3": [
					"one",
					"two",
					{
						"a": "letter A",
						"b": [
							"zero",
						],
					},
				],
			},
		};
		const expected = {
			"x": "letter X",
			"5": 5,
			"a.b": "letter B",
			"a.d.e": "letter E",
			"1.2": "two",
			"1.3[0]": "one",
			"1.3[1]": "two",
			"1.3[2].a": "letter A",
			"1.3[2].b[0]": "zero",
		};
		expect(nestFlatten(initial)).toEqual(expected);
	});
	it("flattens objects deeply", () => {
		const initial = {
			"1": {
				"3": [
					{
						"b": [
							1678.03,
						],
					},
				],
			},
		};
		const expected = {
			"1.3[0].b[0]": 1678.03,
		};
		expect(nestFlatten(initial)).toEqual(expected);
	});
	it("flattens objects deeply", () => {
		const initial = [
			[
				[
					[
						[
							Infinity,
							NaN,
						],
					],
				],
			],
		];
		const expected = {
			"[0][0][0][0][0]": Infinity,
			"[0][0][0][0][1]": NaN,
		};
		expect(nestFlatten(initial)).toEqual(expected);
	});
});
describe("nestExpand", () => {
	it("Expands (unflattens) deep nested arrays", () => {
		const initial = {
			"[0][0][0][0][0]": Infinity,
			"[0][0][0][0][1]": NaN,
		};
		const expected = [
			[
				[
					[
						[
							Infinity,
							NaN,
						],
					],
				],
			],
		];
		expect(nestExpand(initial)).toEqual(expected);
	});
	it("Expands (unflattens) deep mixed objects", () => {
		const initial = {
			"1.3[0].b[0]": 1678.03,
		};
		const expected = {
			"1": {
				"3": [
					{
						"b": [
							1678.03,
						],
					},
				],
			},
		};
		expect(nestExpand(initial)).toEqual(expected);
	});
});
/* eslint-enable */
