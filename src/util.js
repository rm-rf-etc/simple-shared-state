import { omit } from 'lodash';

export const st = fn=> setTimeout(fn, 0);

export const mt = fn=> Promise.resolve().then(fn);

export const nodeRead = node=> {
	let result;
	node.once(data => { result = data; });
	return result;
};

export const strip = (thing) => omit(thing, "_");

export const stripDeep = (thing) => {
	if (typeof thing !== 'object') return thing;

	function stripProp(prop, thing) {
		if (typeof thing[prop] !== 'object') return;
		thing[prop] = omit(thing[prop], "_");
		Object.keys(thing[prop]).forEach(next => stripProp(next, thing[prop]));
	}

	thing = omit(thing, "_");
	Object.keys(thing).forEach(key => stripProp(key, thing));

	return thing;
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
