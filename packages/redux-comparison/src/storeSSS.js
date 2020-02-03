import { Store } from 'simple-shared-state';

const state = {
	gridSize: 1,
	squareColors: [
		[0, 0, 0],
	],
	example: {
		thing1: {
			a: 1,
			b: 2,
		}
	}
};

const actions = () => ({
	changeGridSize: (gridSize) => ({
		gridSize,
		squareColors: Array(gridSize * gridSize).fill([0,0,0]),
	}),
	changeColors: (squareColors) => ({
		squareColors,
	}),
	changeExample: () => ({
		example: {
			thing1: {
				a: `changed! ${Math.random()}`,
				b: `changed! ${Math.random()}`,
			}
		}
	}),
});

// export default new Store(state, actions, window.__REDUX_DEVTOOLS_EXTENSION__);
export default new Store(state, actions);

export const altStoreSSS = new Store(state, actions);
