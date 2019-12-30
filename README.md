# ReduxLite

Redux is verbose. ReduxLite is brief.

- Documentation: [https://reduxlite.com](https://reduxlite.com)
- Git Repo: [https://github.com/rm-rf-etc/reduxlite](https://github.com/rm-rf-etc/reduxlite)

## Basic Use

First create a store.
```javascript
import { createStore } from "reduxlite";

const initialState = {
  user: {
    name: "Alice",
    slogan: "ReduxLite makes apps fun again",
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
    slogan: "ReduxLite is better than cat memes",
  },
});
// 'user snapshot:' { name: 'Alice', slogan: 'ReduxLite is better than cat memes' }
```

## Status

ReduxLite was first born in late Dec. 2019. There's still more testing needed, particularly on performance with react.
But your willingness to try out ReduxLite and report back your experience would greatly help me in developing its API.
The main goal of ReduxLite is to reduce codebase verbosity in a flux/redux-like architecture.

## Concepts

Redux and ReduxLite have slightly different scope. If you're comparing one to the other in terms of performance, note
that ReduxLite has more features (with a little less than half the code). The included test suite has some performance
tests if you're interested.

Terms like `reducers` and `action creators` will be reused for developer familiarity, but a "reducer" in ReduxLite is
not the same as a "reducer" in Redux.

## Future Work

- Buckets for batching dispatch events and creation of action creators
- Network connector for concise async handling (no thunks for us)
- Redux DevTools integration
