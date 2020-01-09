import { createStore, partialArray, swapArray } from "simple-shared-state";

const initialState = {
	counters: {
		count1: 0,
		count2: 0,
	},
	todos: [
		{ id: 0, label: 1, key: "a" },
		{ id: 1, label: 2, key: "b" },
		{ id: 2, label: 3, key: "c" },
	],
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
	pushTodo: (label) => {
		const len = getState(s => s.todos.length);
		return {
			todos: partialArray(len, {
				id: len,
				label,
				key: Math.random().toString().split(".")[1],
			}),
		};
	},
	popTodo: () => ({
		todos: [].pop,
	}),
	removeTodo: (id) => {
		const todos = getState(s => s.todos);
		const idx = todos.findIndex((todo) => todo.id === id);
		const newArray = todos.slice(0, idx).concat(todos.slice(idx + 1, todos.length));
		return {
			todos: swapArray(newArray),
		};
	},
});

export default createStore(initialState, actions, window.__REDUX_DEVTOOLS_EXTENSION__);
