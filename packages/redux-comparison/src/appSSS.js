import React from 'react';
import GridApp from './components/gridApp';
import ColorSquare from './components/colorSquareSSS';
import randomRGB from './lib/randomRGB';
import useSharedState from 'use-simple-shared-state';
import store from './storeSSS';
import styled from 'styled-components';
import getStats from './lib/stats';
import Stats from 'stats-incremental';

let stats = Stats();


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

const changeSize = (e) => changeGridSize(e.target.value);

const App = () => {
  const [gridSize, example] = useSharedState(store, [s => s.gridSize, s => s.example]);
  const [scoreState, setScoreState] = React.useState('');

  const handleClick = React.useCallback(() => {
    const t1 = performance.now();
    
    const changes = {};
    for(let i=0; i < gridSize * gridSize; i++) {
      if (Math.random() > 0.5) {
        changes[i % (gridSize * gridSize)] = randomRGB();
      }
    }
    changeColors(changes);

    const t2 = performance.now();
    stats.update(t2 - t1);

    setScoreState(getStats('SSS', stats.getAll()));
  }, [gridSize]);

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
            clickStart={handleClick}
            changeSize={changeSize}
            size={gridSize}
            ColorSquare={ColorSquare}
          />
        </Col>
      </TwoCol>
    </>
  );
}

export default App;
