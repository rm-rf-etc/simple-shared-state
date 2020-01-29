import { Store } from 'simple-shared-state';

const state = {
	gridSize: 1,
	squareColors: new Array(2 * 2).fill([0,0,0])
};

const actions = () => ({
	changeGridSize: (gridSize) => ({
		gridSize,
		squareColors: Array(gridSize * gridSize).fill([0,0,0]),
	}),
	changeColors: (i, squareColor) => ({
		squareColors: { [i]: squareColor },
	}),
});

export default new Store(state, actions);
