import React from 'react';
import ColorSquareGrid from './squareGrid';

export default ({ clickStart, clickStart2, runOnce, changeSize, size, ColorSquare }) => (
    <div className="App">
        <ColorSquareGrid
            gridSize={size}
            ColorSquare={ColorSquare}
        />
        <br />

        <div>
            <button onClick={clickStart2}>Run Disconnected</button>
        </div>
        <div>
            <button onClick={clickStart}>Run</button>
            <button onClick={runOnce}>Run Once</button>
        </div>
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
