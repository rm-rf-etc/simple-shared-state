const initialState = {
  gridSize: 1,
  squareColors: [
    [0,0,0],
  ],
  example: {
    thing1: {
      a: 1,
      b: 2,
    }
  }
};

function reducer(state = initialState, action) {
  switch(action.type) {
    case 'CHANGE_EXAMPLE': {
      const newState = { ...state };
      newState.example.thing1.a = `changed! ${Math.random()}`;
      newState.example.thing1.b = `changed! ${Math.random()}`;
      return newState;
    }
    case 'CHANGE_COLORS': {
      return {
        ...state,
        squareColors: {
          ...state.squareColors,
          ...action.newColors,
        },
      };
    }
    case 'CHANGE_GRID_SIZE': {
      return {
        ...state,
        gridSize: action.newSize,
        squareColors: Array(action.newSize * action.newSize)
          .fill([0,0,0]),
      };
    }
    default:
      return state;
  }
}

export default reducer;
