import React from 'react';
import ColorSquareGrid from './squareGrid';

export default ({ clickStart, changeSize, size, ColorSquare }) => (
    <div className="App">
        <ColorSquareGrid gridSize={size} ColorSquare={ColorSquare} />
        <br />

        <button onClick={clickStart}>Run</button>
        <br/>

        <input
            type="range"
            min="1"
            max="40"
            step="1"
            value={size}
            onChange={changeSize}
        />
        <span>{size}</span>
    </div>
);
