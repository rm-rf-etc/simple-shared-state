import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const ColorSquareContainer = styled.div`
width: 100%;
height: 100%;
`

const ColorSquare = ({ index }) => {
  const [r,g,b] = useSelector(state => state.squareColors[index]);

  return (
    <ColorSquareContainer style={{ background: `rgb(${r}, ${g}, ${b})` }} />
  );
};

export default ColorSquare;
