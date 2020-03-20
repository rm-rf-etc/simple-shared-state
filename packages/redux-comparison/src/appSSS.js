import React from 'react';
import GridApp from './components/gridApp';
import ColorSquare from './components/colorSquareSSS';
import randomRGB from './lib/randomRGB';
import useSharedState from 'use-simple-shared-state';
import store, { altStoreSSS } from './storeSSS';
import styled from 'styled-components';
import getStats from './lib/stats';
import Stats from 'stats-incremental';

let stats = Stats();
let running = false;
let running2 = false;


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

const { changeColors, changeGridSize, changeExample } = store.actions;

const resetScores = () => stats = Stats();

const changeSize = (value) => changeGridSize(value);
const changeSize2 = (value) => altStoreSSS.actions.changeGridSize(value);

const App = () => {
  const [gridSize, example] = useSharedState(store, [s => s.gridSize, s => s.example]);
  const [scoreState, setScoreState] = React.useState('');

  const scoreIt2 = () => {
    const changes = {};
    for(let i=0; i < (gridSize * gridSize); i++) {
      changes[i] = randomRGB();
    }

    const t1 = performance.now();
    altStoreSSS.actions.changeColors(changes);

    const t2 = performance.now();
    stats.update(t2 - t1);

    setScoreState(getStats('SSS', stats.getAll()));
  };

  const scoreIt = () => {
    const t1 = performance.now();
    
    const changes = {};
    for(let i=0; i < (gridSize * gridSize); i++) {
      changes[i] = randomRGB();
    }
    changeColors(changes);

    const t2 = performance.now();
    stats.update(t2 - t1);

    setScoreState(getStats('SSS', stats.getAll()));
  };

  const handleClick = () => {
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
  };
  const handleClick2 = () => {
    if (running2) {
      running2 = false;
      return;
    }
    running2 = true;
    loop2();

    function loop2() {
      if (running2) {
        scoreIt2();
        setTimeout(loop2, 500);
      }
    }
  }

  return (
    <>
      <h3>Simple Shared State</h3>
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
            example.thing1.a: {example.thing1.a}
          </Pre>
          <Pre>
            example.thing1.b: {example.thing1.b}
          </Pre>
        </Col>
        <Col start="1">
          <GridApp
            size={gridSize}
            runOnce={scoreIt}
            clickStart={handleClick}
            clickStart2={handleClick2}
            ColorSquare={ColorSquare}
            changeSize={({ target }) => {
              changeSize(target.value);
              changeSize2(target.value);
            }}
          />
        </Col>
      </TwoCol>
    </>
  );
}

export default App;
