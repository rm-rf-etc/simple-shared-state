# React-GUN

_Auto-generate data bindings between react component and GUN DB nodes_

With GUN, you can replace both redux and firebase (or equivalent state management
and persistent storage). Or you can replace just one, the choice is yours.

## Install

`yarn add https://github.com/rm-rf-etc/react-gun`

## Status
**_Currently in beta_**

### Known Limitations
* Only works with function components
* `bind()` cannot be called from inside a React function component, it must be
declared externally and used via reference

## Mostly Self-Contained Demo

```
import React from 'react';
import ReactDOM from 'react-dom';
import bind from 'react-gun';
import Gun from 'gun';
const gun = Gun();

const increment = (node) => (
  () => node.once((val = 0) => node.put(val + 1))
);

const App = ({ gun: { counter = 0, _root } }) => (
  <p>
    <button onClick={ increment(_root.get('counter')) }>
      Increment
    </button>
    <span>{counter}</span>
  </p>
);

const MyApp = bind(gun.get('counter/1'))(App);

ReactDOM.render(<MyApp />, document.body);
```
