import { createStore } from "simple-shared-state";

const store = createStore({
	user: {},
	team: {},
	organization: {},
	counters: {
		count1: 0,
	},
});

window.store = store;

export default store;
