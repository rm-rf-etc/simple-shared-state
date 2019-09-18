
export default (construct, identity, nodeBucket) => {
	if (!construct.state) throw new Error("Bucket construct must include `state` property");
	if (!construct.reducers) throw new Error("Bucket construct must include `reducers` property");

	let hydrated = false;

	const getState = () => ({ ..._private.state });

	let devtools;
	const connectDevTools = (dt) => {
		devtools = dt;
		devtools.send({}, _private.state);

		return struct;
	};

	const _private = {
		nodeBucket,
		propNodes: {},
		watchList: {},
		listeners: {},
		state: {},
	};

	const actions = {};
	const bucketReducers = construct.reducers(getState);

	Object.keys(bucketReducers).forEach(reducerName => {
		const actionName = `${identity.description}::${reducerName}`;

		actions[reducerName] = async (...args) => {
			const value = await bucketReducers[reducerName](...args);
			const newState = { ..._private.state, ...value };
			nodeBucket.put(newState);
			if (devtools && devtools.send) {
				devtools.send({ type: actionName, payload: args.slice(1) }, newState);
			}
		};
	});

	const struct = {
		[Symbol.for('identity')]: identity,
		[Symbol.toStringTag]: 'WeirStruct',
		actions,
		getState,
		connectDevTools,

		triggerWatchers(propKey) {
			const watchers = _private.watchList[propKey];
			if (watchers) watchers.forEach(fn => fn(_private.state[propKey]));
		},

		rehydrate() {
			if (hydrated) return _private.state;

			Object.entries(construct.state).forEach(([propKey, propVal]) => {
				propVal = propVal.default || propVal;

				const node = nodeBucket.get(propKey);
				const watchers = new Set();
				_private.watchList[propKey] = watchers;
				_private.propNodes[propKey] = node;
				_private.state[propKey] = propVal;

				node.once(val => {
					_private.state[propKey] = val || propVal;
					node.put(val || propVal);
				});
				node.on((val, key, _, evt) => {
					_private.state[key] = val;
					watchers.forEach(fn => fn(key, val));
					// if we later need to remove the listener
					if (!_private.listeners[propKey]) _private.listeners[propKey] = evt;
				});
			});

			hydrated = true;

			return _private.state;
		},

		vacate() {
			Object.values(_private.watchList).forEach(w=> w.clear());
			Object.values(_private.listeners).forEach(l=> l.off());
		},

		sub(propKey, listener) {
			_private.watchList[propKey] = _private.watchList[propKey] || new Set();
			_private.watchList[propKey].add(listener);
		},

		unsub(propKey, listener) {
			_private.watchList[propKey].delete(listener);
		},

		put(propKey, propVal) {
			const node = _private.propNodes[propKey];
			if (!node) { console.warn(`No propKey match for '${propKey}'`); return; }
			node.put(propVal);
		}
	};

	return struct;
};
