# Simple Shared State

Redux is verbose. SimpleSharedState is brief.

- Docs: [https://simplesharedstate.com](https://simplesharedstate.com)
- Repo: [https://github.com/rm-rf-etc/simple-shared-state](https://github.com/rm-rf-etc/simple-shared-state)
- Example app: [https://simple-shared-state.stackblitz.io/](https://simple-shared-state.stackblitz.io/)
- Edit online: [https://stackblitz.com/edit/simple-shared-state](https://stackblitz.com/edit/simple-shared-state)


## Status

SimpleSharedState is still relatively experimental. Versions are following semver, but the version being greater
than 1.0 doesn't mean it's considered production ready just yet. Please review the project source and tests to
determine if it's viable for your project. More elaborate tests are needed to test SimpleSharedState performance
against Redux.


## Get It

```
npm install simple-shared-state
```

If using script tags:
```html
<script src="https://unpkg.com/simple-shared-state"></script>
<script>
  const store = new SimpleSharedState.Store({});
</script>
```

### Support for Internet Explorer

Use `dist/simple-shared-state.es5.umd.js`. For example:
```html
<script src="https://unpkg.com/simple-shared-state/dist/simple-shared-state.es5.umd.js"></script>
```


## Basic Use

First create a store.
```javascript
import { Store } from "simple-shared-state";

const initialState = {
  user: {
    name: "Alice",
    slogan: "simple-shared-state makes apps fun again",
  },
};
const actions = () => ({
  changeSlogan: (newSlogan) => ({
    user: {
      slogan: newSlogan,
    },
  }),
});
const store = new Store(initialState, actions);
```
Then create a watcher. Don't worry about error handling in selectors, just return
the state that you want.
```javascript
const selector = (state) => state.user;

store.watch(selector, (state) => {
  console.log("user snapshot:", state);
});
```
Then call your action to update state and trigger the watch handler.
```javascript
store.actions.changeSlogan("simple-shared-state is better than cat memes");
// 'user snapshot:' { name: 'Alice', slogan: 'simple-shared-state is better than cat memes' }
```


## Redux Devtools

Works with devtools, of course. Just pass in the reference like this:
```javascript
const store = new Store(initialState, actions, window.__REDUX_DEVTOOLS_EXTENSION__);
```


## React Hooks

[useSimpleSharedState](https://npmjs.com/package/use-simple-shared-state)


## Future Work

- Fix redux devtools integration
- Add support for async/await in action creators
- Support typescript types
- Explore potential to optimize selector processing for very large state trees
