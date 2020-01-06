import React from "react";
import "./App.css";
import store from "./store";
import useSimpleSharedState from "use-simple-shared-state";

const selectors = [
  (state) => state.counters.count1,
  (state) => state.counters.count2,
];

const {
  counterOneIncrement,
  counterOneDecrement,
  counterTwoIncrement,
  counterTwoDecrement,
} = store.actions;

const App = () => {
  const [count1, count2] = useSimpleSharedState(store, selectors);
  return (
    <div className="App">
      <div>
        <span>{count1}</span>
        <button onClick={counterOneIncrement}>+</button>
        <button onClick={counterOneDecrement}>-</button>
      </div>
      <div>
        <span>{count2}</span>
        <button onClick={counterTwoIncrement}>+</button>
        <button onClick={counterTwoDecrement}>-</button>
      </div>
    </div>
  );
}

export default App;
