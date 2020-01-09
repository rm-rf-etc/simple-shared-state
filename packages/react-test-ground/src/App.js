import React, { useState } from "react";
import "./App.css";
import store from "./store";
import useSharedState from "use-simple-shared-state";

const selectors = [
  (state) => state.counters.count1,
  (state) => state.counters.count2,
  (state) => state.todos,
];

const {
  setCounter1,
  setCounter2,
  incrementCounter1,
  decrementCounter1,
  incrementCounter2,
  decrementCounter2,
  pushTodo,
  popTodo,
} = store.actions;

const App = () => {
  const [count1, count2, todos] = useSharedState(store, selectors);
  const [field1, setField1] = useState(0);
  const [field2, setField2] = useState(0);
  const [field3, setField3] = useState("");

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
      <div>
        <input type="text" value={field3} onChange={({ target }) => setField3(target.value)}></input>
        <button onClick={() => { pushTodo(field3); setField3(""); }}>Add To-Do</button>
        <button onClick={popTodo}>Remove To-Do</button>
      </div>
      <div>
        <ul>
          {todos.map((todo) => (
            <li key={todo.key}>{todo.label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
