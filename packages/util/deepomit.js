import omit from "lodash.omit";
import keys from "lodash.keys";

export default (ref1) => {
	if (typeof ref1 !== "object") return ref1;

	function stripProp(prop, ref2) {
		if (typeof ref2[prop] !== "object") return;
		/* eslint-disable-next-line no-param-reassign */
		ref2[prop] = omit(ref2[prop], "_");
		keys(ref2[prop]).forEach((next) => stripProp(next, ref2[prop]));
	}

	const newRef1 = omit(ref1, "_");
	keys(ref1).forEach((key) => stripProp(key, newRef1));

	return newRef1;
};
