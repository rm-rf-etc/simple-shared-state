# SimpleSharedState

Redux is verbose. SimpleSharedState is brief.

- Documentation: [https://simple-shared-state.com](https://simple-shared-state.com)
- Git Repo: [https://github.com/rm-rf-etc/simple-shared-state](https://github.com/rm-rf-etc/simple-shared-state)

## Basic Use

First create a store.
```javascript
import { createStore } from "simple-shared-state";

const initialState = {
  user: {
    name: "Alice",
    slogan: "SimpleSharedState makes apps fun again",
  },
};
const store = createStore(initialState);
```
Then create a watcher.
```javascript
const selector = (state) => state.user;

store.watch(selector, (state) => {
  console.log("user snapshot:", state);
});
```
Then call dispatch to update state and trigger the watch handler.
```javascript
store.dispatch({
  user: {
    slogan: "SimpleSharedState is better than cat memes",
  },
});
// 'user snapshot:' { name: 'Alice', slogan: 'SimpleSharedState is better than cat memes' }
```

## Status

SimpleSharedState was first born in late Dec. 2019. There's still more testing needed, particularly on performance with react.
But your willingness to try out simple-shared-state and report back your experience would greatly help me in developing its API.
The main goal of simple-shared-state is to reduce codebase verbosity in a flux/redux-like architecture.

## Concepts

Redux and SimpleSharedState have slightly different scope. If you're comparing one to the other in terms of performance, note
that SimpleSharedState has more features (with a little less than half the code). The included test suite has some performance
tests if you're interested, and you can test the build result with `yarn build && yarn test-dist`.

Terms like `reducers` and `action creators` will be reused for developer familiarity, but a "reducer" in SimpleSharedState is
not the same as a "reducer" in Redux.

## Future Work

- Buckets for batching dispatch events and creation of action creators
- Network connector for concise async handling (no thunks for us)
- Redux DevTools integration
