import React from 'react';
import store from '../storeSSS';
import useSharedState from 'use-simple-shared-state';
import styled from 'styled-components';

const ColorSquareContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const ColorSquare = ({ index }) => {
  const [[r,g,b]] = useSharedState(store, [s => s.squareColors[index]]);

  return (
    <ColorSquareContainer style={{ background: `rgb(${r}, ${g}, ${b})` }} />
  )
}

export default ColorSquare;
