import { Store, partialArray } from "simple-shared-state";

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

const actions = (getState) => ({
	setCounter1: (value) => ({
		counters: { count1: +value },
	}),
	incrementCounter1: () => ({
		counters: { count1: getState(s => s.counters.count1) + 1 },
	}),
	decrementCounter1: () => ({
		counters: { count1: getState(s => s.counters.count1) - 1 },
	}),
	pushTodo: (label) => {
		const len = getState(s => s.todos.length);
		return {
			todos: partialArray(len, {
				label,
				key: Math.random().toString().split(".")[1],
			}),
		};
	},
	popTodo: () => ({
		todos: [].pop,
	}),
	removeTodo: (key) => {
		const todos = getState(s => s.todos);
		const idx = todos.findIndex((todo) => todo.key === key);
		const newArray = todos.slice(0, idx).concat(todos.slice(idx + 1, todos.length));

		return {
			todos: newArray,
		};
	},
});

export default new Store(initialState, actions, window.__REDUX_DEVTOOLS_EXTENSION__);
