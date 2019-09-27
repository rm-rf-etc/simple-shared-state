import { useReducer, useEffect } from "react";
import strip from "weir.util/deepomit";
import zip from "lodash.zipobjectdeep";
import merge from "lodash.merge";

const { isArray } = Array;

const reducer = (state, { propKey, propVal }) => {
	// if (propKey === "deviceList") console.log("REDUCER", JSON.stringify(state, null, "\t"));
	const newState = {
		...state,
	};

	if (typeof propKey === "string" && propKey.match(/\./)) {
		const branch = zip([propKey], [propVal]);
		merge(newState, branch);
	} else {
		newState[propKey] = propVal;
	}

	// if (propKey === "deviceList") console.log("REDUCER", JSON.stringify(newState, null, "\t"));
	return newState;
};

export default (bucket, watchList) => {
	if (!bucket || bucket.toString() !== "[object WeirStruct]") {
		throw new Error("`useBucket` takes only a valid WeirStruct for 1st argument");
	}
	if (bucket.watchListRequired && (!isArray(watchList) || watchList.some((v) => typeof v !== "string"))) {
		throw new Error("`useBucket` requires an array of strings for watchList");
	}
	const [state, dispatch] = useReducer(reducer, bucket.getState());
	Object.setPrototypeOf(state, bucket.getState().constructor.prototype);

	useEffect(() => {
		bucket.setListeners(watchList, (path, val) => {
			dispatch({
				propKey: path,
				propVal: strip(val),
			});
		});

		return bucket.vacate;
	}, []);

	return state;
};
