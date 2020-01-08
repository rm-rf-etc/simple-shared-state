# SimpleSharedState React Hook

Redux is verbose. SimpleSharedState is brief.

- Docs: [https://simplesharedstate.com](https://simplesharedstate.com)
- Repo: [https://github.com/rm-rf-etc/simple-shared-state](https://github.com/rm-rf-etc/simple-shared-state)
- Example app: https://simple-shared-state.stackblitz.io/
- Edit online: https://stackblitz.com/edit/simple-shared-state


## Get It

```
npm install use-simple-shared-state
```

## Basic Use

Assuming you already have a store made with `simple-shared-state`:
```javascript
import React from "react";
import useSharedState from "use-simple-shared-state";
import store from "./store.js";

const selectors = [
	(state) => state.counter1,
	(state) => state.examples.user,
	// put as many selectors here as you need
];

export const MyComponent = () => {
	const [count1, someObject] = useSharedState(store, selectors);
	return (
		<div>
			<h1>Hello World</h1>
			<span>{count1}</span>
			<pre>{JSON.stringify(someObject)}</pre>
		</div>
	)
};
```

That's all there is to it.
