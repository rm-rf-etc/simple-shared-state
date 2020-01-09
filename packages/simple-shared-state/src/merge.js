const shift = [].shift;
const pop = [].pop;
const { isArray } = Array;

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
 * import { createStore, deleted } from "simple-shared-state";
 *
 * const actions = () => ({
 *   removeB: () => ({
 *     b: deleted,
 *   }),
 * });
 * const store = createStore({ a: 1, b: 2 }, actions);
 * console.log(store.getState()); // { a: 1, b: 2 }
 *
 * store.actions.removeB();
 *
 * // state: { a: 1 }
 */
export const deleted = new Number();

export class Swappable {
	constructor(array) {
		this.wrapped = array;
	}
}

const merge = (tree, branch) => {
	if (tree && branch && typeof tree === "object") {
		if (Object.getPrototypeOf(branch) === Swappable.prototype) {
			return branch.wrapped.slice();
		}
		Object.keys(branch).forEach((key) => {
			if (branch[key] === pop && isArray(tree[key])) {
				tree[key] = tree[key].slice(0, tree[key].length - 1);
				return;
			}
			if (branch[key] === shift && isArray(tree[key])) {
				tree[key] = tree[key].slice(1, tree[key].length);
				return;
			}
			if (branch[key] && Object.getPrototypeOf(branch[key]) === Swappable.prototype) {
				tree[key] = branch[key].wrapped.slice();
				return;
			}
			if (branch[key] === deleted) {
				delete tree[key];
			} else {
				tree[key] = merge(tree[key], branch[key]);
			}
		});
		return tree;
	}
	return branch;
};

export default merge;
