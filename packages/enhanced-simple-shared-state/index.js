
export default (Store) => {
	Store.prototype.newDerivedState = newDerivedState;
	Store.prototype.addPartialState = addPartialState;
};

function newDerivedState({ label, selectors, getPartial, putPartial, actions }) {
	const partialStateStore = new Store({});
	const actionsObject = actions(partialStateStore);

	// Create a lifted version of each developer-provided action.
	Object.keys(actionsObject).forEach((actionName) => {
		const actionLabel = `${label}.${actionName}()`;

		partialStateStore.actions[actionName] = (...args) => {
			const branch = actionsObject[actionName](...args);
			this.dispatchTyped(actionLabel, putPartial(args, branch));
		};
	});

	const unwatch = this.watchBatch(selectors, (args) => {
		partialStateStore.dispatchTyped("derived change", getPartial(args));
	});

	partialStateStore.destroy = () => unwatch();

	return partialStateStore;
};

function addPartialState({ label, partialStateStore }) {
	this.dispatchTyped("state received", {
		[label]: partialStateStore.getState(),
	});
	partialStateStore.watchDispatch(() => {
		this.stateTree[label] = partialStateStore.getState();
	});
	this.watch(s => s[label], (state) => {
		partialStateStore.stateTree = Object.assign({}, state);
	});
};
