import React from 'react';
import './App.css';
import store from './store';
import useSimpleSharedState from "use-simple-shared-state";

const selectors = [
  (state) => state.counters.count1,
  (state) => state.counters.count2,
];

let count1 = 0;
let count2 = 0;

store.watch((s) => s.counters.count1, (value) => count1 = value);
store.watch((s) => s.counters.count2, (value) => count2 = value);

const increment1 = () => store.dispatch({ counters: { count1: count1 + 1 } });
const decrement1 = () => store.dispatch({ counters: { count1: count1 - 1 } });

const increment2 = () => store.dispatch({ counters: { count2: count2 + 1 } });
const decrement2 = () => store.dispatch({ counters: { count2: count2 - 1 } });


const App = () => {
  const [count1, count2] = useSimpleSharedState(store, selectors);
  return (
    <div className="App">
      <div>
        <span>{count1}</span>
        <button onClick={increment1}>+</button>
        <button onClick={decrement1}>-</button>
      </div>
      <div>
        <span>{count2}</span>
        <button onClick={increment2}>+</button>
        <button onClick={decrement2}>-</button>
      </div>
    </div>
  );
}

export default App;
