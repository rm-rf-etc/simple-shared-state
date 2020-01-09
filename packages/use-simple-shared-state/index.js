import { useEffect, useState } from "react";

export default (store, selectors) => {
	const [state, setState] = useState([]);

	useEffect(() => {
		const unwatch = store.watchBatch(selectors, (array) => {
			setState(array.slice());
		});
		return unwatch;
	}, []);

	if (state.length) return state;

	const storeState = store.getState();
	return selectors.map((fn) => {
		let snapshot;
		try {
			snapshot = fn(storeState);
		} catch (_) {}

		return snapshot;
	});
};
