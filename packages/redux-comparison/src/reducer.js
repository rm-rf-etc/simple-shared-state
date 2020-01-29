const initialState = {
  gridSize: 1,
  squareColors: [[0,0,0]]
};

function reducer(state = initialState, action) {
  switch(action.type) {
    case 'CHANGE_COLOR':
      const newState = { ...state };
      newState.squareColors[action.index] = action.newColors;
      return newState;
    
    case 'CHANGE_GRID_SIZE':
      return {
        gridSize: action.newSize,
        squareColors: Array(action.newSize * action.newSize).fill([0,0,0]),
      };

    default:
      return state;
  }
}

export default reducer;
