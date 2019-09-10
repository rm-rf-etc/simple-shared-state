import { omit } from 'lodash';

export const st = fn=> setTimeout(fn, 0);

export const mt = fn=> Promise.resolve().then(fn);

export const strip = (thing) => omit(thing, "_");

export const nodeRead = node=> {
	let result;
	node.once(data => { result = data; });
	return result;
};

export const stripDeep = (thing) => {
	if (typeof thing !== 'object') return thing;
	thing = strip(thing);

	Object.keys(thing).forEach(key => {
		stripProp(key, thing);
	});

	return thing;
};
const stripProp = (key, thing) => {
	if (typeof thing[key] !== 'object') return;
	thing[key] = omit(thing[key], "_");

	Object.keys(thing[key]).forEach(nextKey => {
		stripProp(nextKey, thing[key]);
	});
};
export const match = (...exps) => (
	exps.find(exp=> exp[0])[1]()
);
export const coordStringToArray = coordStr => (
	coordStr.replace(/^_/, "").split("_").map(s => parseInt(s))
);
export const range = (len) => Array(Math.max(0, len))
	.fill(0)
	.reduce((sum, _, n) => sum.concat(n), []);
