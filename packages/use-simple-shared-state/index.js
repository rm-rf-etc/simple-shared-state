import { useEffect, useState } from "react";

export default (store, selectors) => {
	const [, setState] = useState([]);

	const state = [];
	let enabled = false;
	const unwatchList = [];

	useEffect(() => {
		selectors.forEach((fn, index) => {
			const unwatch = store.watch(fn, (selectedState) => {
				state[index] = selectedState;
				if (enabled) setState(new Number());
			});
			unwatchList.push(unwatch);
		});
		enabled = true;

		console.log('using lib from repo');
		return () => {
			unwatchList.forEach(fn => fn());
			unwatchList.splice(0);
		};
	}, []);

	// only runs on first call
	if (enabled) return state;

	const storeState = store.getState();
	selectors.forEach((fn, index) => {
		let snapshot;
		try {
			snapshot = fn(storeState);
		} catch (_) {}

		state[index] = snapshot;
	});

	return state;
};
