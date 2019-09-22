import { useReducer, useEffect } from "react";
import zip from "lodash.zipobjectdeep";
import merge from "lodash.merge";
import omit from "lodash.omit";

const { isArray } = Array;

const strip = (ref1) => {
	if (typeof ref1 !== "object") return ref1;

	function stripProp(prop, ref2) {
		if (typeof ref2[prop] !== "object") return;
		/* eslint-disable-next-line no-param-reassign */
		ref2[prop] = omit(ref2[prop], "_");
		Object.keys(ref2[prop]).forEach((next) => stripProp(next, ref2[prop]));
	}

	const newRef1 = omit(ref1, "_");
	Object.keys(ref1).forEach((key) => stripProp(key, newRef1));

	return newRef1;
};

const reducer = (state, { propKey, propVal }) => {
	const newState = {
		...state,
	};

	if (typeof propKey === "string" && propKey.match(/\./)) {
		const branch = zip([propKey], [propVal]);
		merge(newState, branch);
	} else {
		newState[propKey] = propVal;
	}

	return newState;
};

export default (bucket, watchList) => {
	const [state, dispatch] = useReducer(reducer, bucket.getState());
	if (!isArray(watchList) || watchList.some((v) => typeof v !== "string")) {
		throw new Error("`useBucket` requires an array of strings for watchList");
	}

	useEffect(() => watchList.forEach((key) => {
		bucket.sub(key, (path, val) => dispatch({
			propKey: path,
			propVal: strip(val),
		}));

		return bucket.vacate;
	}), []);

	return state;
};
