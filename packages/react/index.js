import { useReducer, useEffect } from "react";
import zip from "lodash.zipobjectdeep";
import merge from "lodash.merge";
import omit from "lodash.omit";
const { isArray } = Array;

const strip = (thing) => {
	if (typeof thing !== "object") return thing;

	function stripProp(prop, thing) {
		if (typeof thing[prop] !== "object") return;
		thing[prop] = omit(thing[prop], "_");
		Object.keys(thing[prop]).forEach(next => stripProp(next, thing[prop]));
	}

	thing = omit(thing, "_");
	Object.keys(thing).forEach(key => stripProp(key, thing));

	return thing;
};

const reducer = (state, { propKey, propVal }) => {
	let newState = {
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
	if (!isArray(watchList) || watchList.some(v => typeof v !== "string")) {
		throw new Error("`useBucket` requires an array of strings for watchList");
	}

	useEffect(() => watchList.forEach(key => {
		bucket.sub(key, (path, val) => dispatch({
			propKey: path,
			propVal: strip(val),
		}));

		return bucket.vacate;
	}), []);

	return state;
};
