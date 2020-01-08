import React, { useState } from "react";
import "./App.css";
import store from "./store";
import useSimpleSharedState from "use-simple-shared-state";

const selectors = [
  (state) => state.counters.count1,
  (state) => state.counters.count2,
];

const {
  setCounter1,
  setCounter2,
  incrementCounter1,
  decrementCounter1,
  incrementCounter2,
  decrementCounter2,
} = store.actions;

const App = () => {
  const [count1, count2] = useSimpleSharedState(store, selectors);
  const [field1, setField1] = useState(0);
  const [field2, setField2] = useState(0);

  return (
    <div className="App">
      <div>
        <span>{count1}</span>
        <button onClick={incrementCounter1}>+</button>
        <button onClick={decrementCounter1}>-</button>
        <div>
          <input type="text" value={field1} onChange={({ target }) => setField1(+target.value)}></input>
          <button onClick={() => setCounter1(field1)}>Set</button>
        </div>
      </div>
      <div>
        <span>{count2}</span>
        <button onClick={incrementCounter2}>+</button>
        <button onClick={decrementCounter2}>-</button>
        <div>
          <input type="text" value={field2} onChange={({ target }) => setField2(+target.value)}></input>
          <button onClick={() => setCounter2(field2)}>Set</button>
        </div>
      </div>
    </div>
  );
}

export default App;
