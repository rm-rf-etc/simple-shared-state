/**
 * @member deleted
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
 * import { Store, deleted } from "simple-shared-state";
 *
 * const actions = () => ({
 *   removeB: (prop) => ({
 *     [prop]: deleted,
 *   }),
 * });
 * const store = new Store({ a: 1, b: 2 }, actions);
 * console.log(store.getState()); // { a: 1, b: 2 }
 *
 * store.actions.removeB("b");
 *
 * // state: { a: 1 }
 */
export const deleted = new Number();

const pop = [].pop;
const shift = [].shift;
const isArray = Array.isArray;

export const merge = (tree, branch) => {
	if (tree && branch && typeof tree === "object") {
		Object.keys(branch).forEach((key) => {
			if (isArray(branch[key])) {
				tree[key] = branch[key].slice();
				return;
			}
			if (branch[key] === pop && isArray(tree[key])) {
				tree[key] = tree[key].slice(0, tree[key].length - 1);
				return;
			}
			if (branch[key] === shift && isArray(tree[key])) {
				tree[key] = tree[key].slice(1, tree[key].length);
				return;
			}
			if (branch[key] === deleted) {
				delete tree[key];
				return;
			}
			if (branch[key] && branch[key].isPartial) {
				tree[key] = merge(tree[key], branch[key]);
				return;
			}
			tree[key] = merge(tree[key], branch[key]);
		});
		return tree;
	}
	return branch;
};
