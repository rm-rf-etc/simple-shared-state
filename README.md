# React-GUN

_Auto-generate data bindings between react components and GUN DB nodes_

React-GUN provides auto-magical state management and persistent storage,
in one convenient little library. Simply wrap components and receive data.

## Install

`yarn add https://github.com/rm-rf-etc/react-gun`

## Status
**_Currently in beta_**

### Known Limitations
* Only works with function components
* `bind()` cannot be called from inside a React function component, it must be
declared externally and used via reference

## Demo

Add to your create-react-app project and try it.

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

// 'counter/1' can be any arbitrary string
const MyApp = bind(gun.get('counter/1'))(App);

ReactDOM.render(<MyApp />, document.body);
```

## Dev Testing

If you are using `npm link` to develop the library and test in a local project,
you may encounter this error:
```
Invalid hook call. Hooks can only be called inside of the body of a function
component. This could happen for one of the following reasons
```

You simply need to link react in `react-gun` to the react in your project.  
https://github.com/facebook/react/issues/15315#issuecomment-479802153
