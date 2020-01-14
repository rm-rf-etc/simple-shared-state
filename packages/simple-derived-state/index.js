
export default (Store) => {
	Store.prototype.derivedState = function derivedState(
		storeLabel,
		selectors,
		branchSelector,
		branchMaker,
		actions,
	) {
		const derivedStateStore = new Store({});
		const actionsObject = actions(derivedStateStore);

		// Create a lifted version of each developer-provided action.
		Object.keys(actionsObject).forEach((actionName) => {
			const actionLabel = `${storeLabel}.${actionName}()`;

			derivedStateStore.actions[actionName] = (...args) => {
				const branch = actionsObject[actionName](...args);
				this.dispatch(actionLabel, branchMaker(args, branch));
			};
		});

		const unwatch = this.watchBatch(selectors, (args) => {
			derivedStateStore.dispatch("", branchSelector(args));
		});

		derivedStateStore.destroy = () => unwatch();

		return derivedStateStore;
	}
};
