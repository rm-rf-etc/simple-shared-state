import { createStore } from "simple-shared-state";

const store = createStore({
	counters: {
		count1: 0,
		count2: 0,
	},
}, ({ getState }) => ({
	counterOneSet: (value) => ({
		counters: {
			count1: +value,
		},
	}),
	counterTwoSet: (value) => ({
		counters: {
			count2: +value,
		},
	}),
	counterOneIncrement: () => ({
		counters: {
			count1: getState(s => s.counters.count1)+ 1,
		},
	}),
	counterOneDecrement: () => ({
		counters: {
			count1: getState(s => s.counters.count1)- 1,
		},
	}),
	counterTwoIncrement: () => ({
		counters: {
			count2: getState(s => s.counters.count2) + 1,
		},
	}),
	counterTwoDecrement: () => ({
		counters: {
			count2: getState(s => s.counters.count2) - 1,
		},
	}),
}),
window.__REDUX_DEVTOOLS_EXTENSION__);

export default store;
