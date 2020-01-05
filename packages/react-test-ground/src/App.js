import React from 'react';
import './App.css';
import store from './store';
import useSimpleSharedState from "use-simple-shared-state";

const selectors = [
  (state) => state.counters.count1,
];

let count = 0;

store.watch((s) => s.counters.count1, (value) => {
  console.log("store dispatched:", value);
  count = value;
});

const increment = () => {
  console.log("up", count + 1);
  store.dispatch({ counters: { count1: count + 1 } });
};

const decrement = () => {
  const change = { counters: { count1: count - 1 } };
  console.log("down", change);
  store.dispatch(change);
};

const App = () => {
  const [count1] = useSimpleSharedState(store, selectors);
  return (
    <div className="App">
      <span>{count1}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

export default App;
