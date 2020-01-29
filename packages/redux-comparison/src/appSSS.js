import React from 'react';
import GridApp from './components/gridApp';
import ColorSquare from './components/colorSquareSSS';
import randomRGB from './lib/randomRGB';
import useSharedState from 'use-simple-shared-state';
import store from './storeSSS';

const { changeColors, changeGridSize } = store.actions;

const changeSize = (e) => changeGridSize(e.target.value);

const App = () => {
  const [gridSize] = useSharedState(store, [s => s.gridSize]);

  const handleClick = React.useCallback(() => {
    const t1 = performance.now();
    for(let i=0; i < gridSize * gridSize; i++) {
      changeColors(i % (gridSize * gridSize), randomRGB());
    }
    const t2 = performance.now();
    console.log('  SSS:', t2 - t1);
  }, [gridSize]);

  return (
    <>
      <h3>Simple Shared State</h3>
      <GridApp
        clickStart={handleClick}
        changeSize={changeSize}
        size={gridSize}
        ColorSquare={ColorSquare}
      />
    </>
  );
}

export default App;
