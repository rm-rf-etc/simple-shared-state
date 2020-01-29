import React from 'react';
import styled from 'styled-components';

const gridContainerSize = 300;

const GridContainer = styled.div(({ count }) => `
  display: grid;
  height: ${gridContainerSize}px;
  width: ${gridContainerSize}px;
  grid-gap: 2px;
  grid-template-columns: repeat(${count}, auto);
  grid-template-rows: repeat(${count}, auto);
`);

const ColorSquareGrid = function({ gridSize, ColorSquare }) {
  const squaresList = Array(gridSize * gridSize).fill(0);
  return (
    <GridContainer count={gridSize}>
      {squaresList.map((_, index) => <ColorSquare key={index} index={index} />)}
    </GridContainer>
  )
}

export default ColorSquareGrid;
