import { useEffect, useState } from "react";

export default (store, selectors) => {
	const [state, setState] = useState([]);

	useEffect(() => {
		const unwatch = store.watchBatch(selectors, (newSnapshots) => {
			setState(newSnapshots.slice());
		});
		return unwatch;
	}, []);

	return state;
};
