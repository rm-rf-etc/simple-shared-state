import { createStore } from "simple-shared-state";

const store = createStore({
	counters: {
		count1: 0,
		count2: 0,
	},
}, window.__REDUX_DEVTOOLS_EXTENSION__);

export default store;
