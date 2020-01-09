import { createStore, partialArray } from "simple-shared-state";

const initialState = {
	counters: {
		count1: 0,
		count2: 0,
	},
	todos: [],
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
	pushTodo: (label) => ({
		todos: partialArray(getState(s => s.todos).length, {
			label,
			key: Math.random().toString().split(".")[1],
		}),
	}),
	popTodo: () => ({ todos: [].pop }),
});

export default createStore(initialState, actions, window.__REDUX_DEVTOOLS_EXTENSION__);
