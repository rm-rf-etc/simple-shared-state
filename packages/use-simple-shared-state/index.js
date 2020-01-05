import { useEffect, useState } from "react";

export default (store, selectors) => {
	const [state, setState] = useState([]);

	useEffect(() => {
		const unwatch = store.watchBatch(selectors, (array) => {
			setState(array.slice());
		});
		return unwatch;
	}, []);

	return state;
};
