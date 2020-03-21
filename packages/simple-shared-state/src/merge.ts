import {
	deleted,
	Merge,
	Generic,
	isObjectType,
	isPrimitive,
	isNullOrUndefined,
} from "./types";

const isArray = Array.isArray;

export const merge = <T extends Generic, U extends Generic>(tree: T, branch: U): Merge<T, U> => {
	const newTree: any = isArray(tree) ? [ ...tree ] : { ...tree };
	if (isObjectType(newTree) && isObjectType(branch)) {
		Object.keys(branch).forEach((key) => {
			if (branch[key] === deleted) {
				delete newTree[key];
				return;
			}
			if (isArray(branch[key])) {
				newTree[key] = branch[key];
				return;
			}
			if (isObjectType(branch[key])) {
				newTree[key] = merge(newTree[key], branch[key]);
				return;
			}
			if (isNullOrUndefined(branch[key]) || isPrimitive(branch[key])) {
				newTree[key] = branch[key];
			}
		});
	}
	return newTree;
};
