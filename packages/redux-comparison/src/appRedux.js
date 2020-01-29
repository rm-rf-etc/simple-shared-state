import React from 'react';
import GridApp from './components/gridApp';
import ColorSquareGrid from './components/squareGrid';
import ColorSquare from './components/colorSquareRedux';
import randomRGB from './lib/randomRGB';
import { useSelector } from 'react-redux';
import store from './storeRedux';

const changeSize = (e) => store.dispatch({
  type: 'CHANGE_GRID_SIZE',
  newSize: e.target.value
});

const App = () => {
  const gridSize = useSelector(state => state.gridSize);

  const handleClick = React.useCallback(() => {
    const t1 = performance.now();
    for(let i=0; i < gridSize * gridSize; i++) {
      store.dispatch({
        type: 'CHANGE_COLOR',
        index: i % (gridSize * gridSize),
        newColors: randomRGB(),
      });
    }
    const t2 = performance.now();
    console.log('Redux:', t2 - t1);
  }, [gridSize]);

  return (
    <>
      <h3>Redux</h3>
      <GridApp
        size={gridSize}
        clickStart={handleClick}
        changeSize={changeSize}
        ColorSquareGrid={ColorSquareGrid}
        ColorSquare={ColorSquare}
      />
    </>
  );
}

export default App;
