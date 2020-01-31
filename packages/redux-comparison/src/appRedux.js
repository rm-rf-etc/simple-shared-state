import React from 'react';
import GridApp from './components/gridApp';
import ColorSquareGrid from './components/squareGrid';
import ColorSquare from './components/colorSquareRedux';
import randomRGB from './lib/randomRGB';
import { useSelector } from 'react-redux';
import store from './storeRedux';
import styled from 'styled-components';
import getStats from './lib/stats';
import Stats from 'stats-incremental';

let stats = Stats();

let running = false;

const TwoCol = styled.div`
display: grid;
grid-gap: 20px;
grid-template-columns: 0fr auto;
`;
const Col = styled.div(({ start }) => `
grid-column: ${start};
grid-row: 1;
`);
const Pre = styled.pre`
width: 100%;
`;

const resetScores = () => stats = Stats();

const changeSize = (e) => store.dispatch({
  type: 'CHANGE_GRID_SIZE',
  newSize: e.target.value,
});

const changeExample = () => store.dispatch({
  type: 'CHANGE_EXAMPLE',
});

const App = () => {
  const gridSize = useSelector(state => state.gridSize);
  const example = useSelector(state => state.example);
  const [scoreState, setScoreState] = React.useState('');
  // useSelector(state => state.example.thing1.a);

  const scoreIt = React.useCallback(() => {
    const t1 = performance.now();

    const changes = {};
    for(let i=0; i < gridSize * gridSize; i++) {
      changes[i] = randomRGB();
    }
    store.dispatch({
      type: 'CHANGE_COLORS',
      newColors: changes,
    });

    const t2 = performance.now();
    stats.update(t2 - t1);

    setScoreState(getStats('Redux', stats.getAll()));
  }, [gridSize]);

  const handleClick = React.useCallback(() => {
    if (running) {
      running = false;
      return;
    }
    running = true;
    loop();

    function loop() {
      if (running) {
        scoreIt();
        setTimeout(loop, 500);
      }
    }
  }, [scoreIt]);

  return (
    <>
      <h3>Redux</h3>
      <TwoCol>
        <Col start="2">
          <button onClick={() => { resetScores(); setScoreState(''); }}>
            Reset Scores
          </button>
          <Pre>
            Metrics:
            {' '}
            {scoreState}
          </Pre>
          <button onClick={changeExample}>Change Example</button>
          <Pre>
            {JSON.stringify(example, null, '\t')}
          </Pre>
          <Pre>
            example.thing1.a: {example && example.thing1.a}
          </Pre>
          <Pre>
            example.thing1.b: {example && example.thing1.b}
          </Pre>
        </Col>
        <Col start="1">
          <GridApp
            size={gridSize}
            runOnce={scoreIt}
            clickStart={handleClick}
            changeSize={changeSize}
            ColorSquareGrid={ColorSquareGrid}
            ColorSquare={ColorSquare}
          />
        </Col>
      </TwoCol>
    </>
  );
}

export default App;
