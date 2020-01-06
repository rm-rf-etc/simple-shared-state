import React, { useState } from "react";
import "./App.css";
import store from "./store";
import useSimpleSharedState from "use-simple-shared-state";

const selectors = [
  (state) => state.counters.count1,
  (state) => state.counters.count2,
];

const {
  counterOneSet,
  counterTwoSet,
  counterOneIncrement,
  counterOneDecrement,
  counterTwoIncrement,
  counterTwoDecrement,
} = store.actions;

const App = () => {
  const [count1, count2] = useSimpleSharedState(store, selectors);
  const [counterOneTemp, setCounterOneTemp] = useState(0);
  const [counterTwoTemp, setCounterTwoTemp] = useState(0);
  return (
    <div className="App">
      <div>
        <span>{count1}</span>
        <button onClick={counterOneIncrement}>+</button>
        <button onClick={counterOneDecrement}>-</button>
        <div>
          <input type="text" value={counterOneTemp} onChange={({ target }) => setCounterOneTemp(+target.value)}></input>
          <button onClick={() => counterOneSet(counterOneTemp)}>Set</button>
        </div>
      </div>
      <div>
        <span>{count2}</span>
        <button onClick={counterTwoIncrement}>+</button>
        <button onClick={counterTwoDecrement}>-</button>
        <div>
          <input type="text" value={counterTwoTemp} onChange={({ target }) => setCounterTwoTemp(+target.value)}></input>
          <button onClick={() => counterTwoSet(counterTwoTemp)}>Set</button>
        </div>
      </div>
    </div>
  );
}

export default App;
