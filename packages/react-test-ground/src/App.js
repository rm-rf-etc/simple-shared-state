import React, { useState } from "react";
import "./App.css";
import store from "./store";
import useSharedState from "use-simple-shared-state";

const selectors = [
  (state) => state.counters.count1,
  (state) => state.todos,
];

const {
  setCounter1,
  incrementCounter1,
  decrementCounter1,
  pushTodo,
  popTodo,
  removeTodo,
} = store.actions;

const App = () => {
  const [count1, todos] = useSharedState(store, selectors);
  const [field1, setField1] = useState(0);
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
        <input type="text" value={field3} onChange={({ target }) => setField3(target.value)}></input>
        <button onClick={() => { pushTodo(field3); setField3(""); }}>Add To-Do</button>
        <button onClick={popTodo}>Remove To-Do</button>
      </div>
      <div>
        <ul>
          {todos.map((todo) => (
            <li key={todo.key}>
              {todo.label}
              <button onClick={() => removeTodo(todo.key)}>&times;</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
