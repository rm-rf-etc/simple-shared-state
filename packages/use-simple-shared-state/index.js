import { useEffect, useState } from "react";

export default (store, selectors) => {
	const [state, setState] = useState([]);

	useEffect(() => {
		const unwatch = store.watchBatch(selectors, (newSnapshots) => {
			setState(Object.assign([], newSnapshots));
		});
		return unwatch;
	}, []);

	return state;
};
