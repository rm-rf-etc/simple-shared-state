# React-GUN

_Auto-generate data bindings between react components and GUN DB nodes_

React-GUN provides auto-magical state management, with offline-first auto-synchronized
storage, as-needed relationships, and real-time updates, all in one convenient little
library. Simply wrap components and receive data.

## Install

`yarn add https://github.com/rm-rf-etc/react-gun`

## Status
**_Currently in beta_**

Current work is focused on developing a simplistic but flexible API around GUN DB's API,
along with primitive data types and convenience methods for all the major use cases.

### Known Limitations
* `bind()` cannot be called from inside a React component.

## Demo

Add to your create-react-app project and try it.

### Function-Based Components
```javascript
import React from 'react';
import { bind } from 'react-gun';

const FunctionalComponent = ({
	'@state': { counter = 0 },
	'@methods': { increment, decrement },
}) => (
	<>
		<div className="col">
			<button onClick={increment}>Increment</button>
			<button onClick={decrement}>Decrement</button>
		</div>
		<div className="col">
			<p>{counter}</p>
		</div>
	</>
);

const methods = (getState, { put }) => ({
	increment: () => put('counter', getState().counter + 1),
	decrement: () => put('counter', getState().counter - 1),
});
export default bind('counter_1', methods)(FunctionalComponent);
```

### Class-Based Components

Class-based components can't infer state props from a function signature,
so instead you define state props by declaring `boundProps` as a static
array.

```javascript
import React from 'react';
import { bind } from 'react-gun';

class ClassComponent extends React.Component {

	static boundProps = ['counter'];

	render() {
		const {
			'@state': { counter = 0 },
			'@methods': { increment, decrement },
		} = this.props;

		return (
			<>
				<div className="col">
					<button onClick={increment}>Increment</button>
					<button onClick={decrement}>Decrement</button>
				</div>
				<div className="col">
					<p>{counter}</p>
				</div>
			</>
		);
	}
}

const methods = (getState, { put }) => ({
	increment: () => put('counter', getState().counter + 1),
	decrement: () => put('counter', getState().counter - 1),
});
export default bind('counter_2', methods)(ClassComponent);
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
