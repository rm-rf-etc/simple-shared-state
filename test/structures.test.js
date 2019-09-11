const { deriveTags, axesExpand, validCoords } = require('../src/structures/dimensional');
const $ = "$";

describe('deriveTags', () => {
	it('converts axis definition to nested arrays', () => {
		const res = axesExpand([['X', 1], ['Y', 3]]);
		expect(res).toEqual([[0,$], [0,1,2,$]]);
	});
	it('makes 2x2 list', () => {
		const axes = [['X', 2], ['Y', 2]];

		const results = deriveTags(axes);
		expect(results).toEqual(['_0_0', '_0_1', '_0_$', '_1_0', '_1_1', '_1_$', '_$_0', '_$_1', '_$_$']);
	});
	it('makes 1x3 list', () => {
		const axes = [['X', 1], ['Y', 3]];

		const results = deriveTags(axes);
		expect(results).toEqual(['_0_0', '_0_1', '_0_2', '_0_$', '_$_0', '_$_1', '_$_2', '_$_$']);
	});
	it('makes 3x1x3 list', () => {
		const axes = [['X', 3], ['Y', 1], ['Z', 3]];

		const results = deriveTags(axes);
		expect(results).toEqual([
			'_0_0_0',
			'_0_0_1',
			'_0_0_2',
			'_0_0_$',
			'_0_$_0',
			'_0_$_1',
			'_0_$_2',
			'_0_$_$',
			'_1_0_0',
			'_1_0_1',
			'_1_0_2',
			'_1_0_$',
			'_1_$_0',
			'_1_$_1',
			'_1_$_2',
			'_1_$_$',
			'_2_0_0',
			'_2_0_1',
			'_2_0_2',
			'_2_0_$',
			'_2_$_0',
			'_2_$_1',
			'_2_$_2',
			'_2_$_$',
			'_$_0_0',
			'_$_0_1',
			'_$_0_2',
			'_$_0_$',
			'_$_$_0',
			'_$_$_1',
			'_$_$_2',
			'_$_$_$',
		]);
	});
	it('makes 3x3x3 list', () => {
		const axes = [['X', 3], ['Y', 3], ['Z', 3]];;

		const results = deriveTags(axes);
		expect(results).toEqual([
			'_0_0_0',
			'_0_0_1',
			'_0_0_2',
			'_0_0_$',
			'_0_1_0',
			'_0_1_1',
			'_0_1_2',
			'_0_1_$',
			'_0_2_0',
			'_0_2_1',
			'_0_2_2',
			'_0_2_$',
			'_0_$_0',
			'_0_$_1',
			'_0_$_2',
			'_0_$_$',
			'_1_0_0',
			'_1_0_1',
			'_1_0_2',
			'_1_0_$',
			'_1_1_0',
			'_1_1_1',
			'_1_1_2',
			'_1_1_$',
			'_1_2_0',
			'_1_2_1',
			'_1_2_2',
			'_1_2_$',
			'_1_$_0',
			'_1_$_1',
			'_1_$_2',
			'_1_$_$',
			'_2_0_0',
			'_2_0_1',
			'_2_0_2',
			'_2_0_$',
			'_2_1_0',
			'_2_1_1',
			'_2_1_2',
			'_2_1_$',
			'_2_2_0',
			'_2_2_1',
			'_2_2_2',
			'_2_2_$',
			'_2_$_0',
			'_2_$_1',
			'_2_$_2',
			'_2_$_$',
			'_$_0_0',
			'_$_0_1',
			'_$_0_2',
			'_$_0_$',
			'_$_1_0',
			'_$_1_1',
			'_$_1_2',
			'_$_1_$',
			'_$_2_0',
			'_$_2_1',
			'_$_2_2',
			'_$_2_$',
			'_$_$_0',
			'_$_$_1',
			'_$_$_2',
			'_$_$_$',
		]);
	});
});
describe('Coordinate validation', () => {
	it('works', () => {
		expect(validCoords([], [['X', 1]])).toBe(true);
		expect(validCoords([null], [['X', 1]])).toBe(true);
		expect(validCoords(['$'], [['X', 1]])).toBe(true);

		expect(validCoords([1], [['X', 1]])).toBe(true);
		expect(validCoords([1, 1], [['X', 1], ['X', 1]])).toBe(true);
		expect(validCoords([1, 2, 3], [['X', 3], ['X', 3], ['X', 3]])).toBe(true);

		expect(validCoords([2], [['X', 1]])).toBe(false);
		expect(validCoords([4, 4, 4], [['X', 1], ['X', 4], ['X', 4]])).toBe(false);
		expect(validCoords([4, 4, 4], [['X', 4], ['X', 1], ['X', 4]])).toBe(false);
		expect(validCoords([4, 4, 4], [['X', 4], ['X', 4], ['X', 1]])).toBe(false);

		expect(validCoords([4, 4], [['X', 4]])).toBe(false);
		expect(validCoords([4], [['X', 4], ['X', 4]])).toBe(true);
	});
});
