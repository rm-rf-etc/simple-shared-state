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

const isArray = Array.isArray;

export const merge = (tree, branch) => {
	if (isArray(branch)) {
		return branch;
	}
	if (tree && branch && typeof tree === "object") {
		Object.keys(branch).forEach((key) => {
			if (isArray(branch[key])) {
				tree[key] = branch[key];
				return;
			}
			if (branch[key] === deleted) {
				delete tree[key];
				return;
			}
			tree[key] = merge(tree[key], branch[key]);
		});
		return tree;
	}
	return branch;
};
