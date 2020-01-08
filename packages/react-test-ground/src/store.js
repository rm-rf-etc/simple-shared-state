import { createStore } from "simple-shared-state";

const initialState = {
	counters: {
		count1: 0,
		count2: 0,
	},
};

const actions = ({ getState }) => ({
	setCounter1: (value) => ({
		counters: { count1: +value },
	}),
	setCounter2: (value) => ({
		counters: { count2: +value },
	}),
	incrementCounter1: () => ({
		counters: { count1: getState(s => s.counters.count1) + 1 },
	}),
	decrementCounter1: () => ({
		counters: { count1: getState(s => s.counters.count1) - 1 },
	}),
	incrementCounter2: () => ({
		counters: { count2: getState(s => s.counters.count2) + 1 },
	}),
	decrementCounter2: () => ({
		counters: { count2: getState(s => s.counters.count2) - 1 },
	}),
});

const store = createStore(initialState, actions, window.__REDUX_DEVTOOLS_EXTENSION__);

export default store;
