import get from "lodash.get";
const priv = Symbol('inaccessible');

const generic = (construct, identity, nodeBucket) => {
	if (!construct.state) throw new Error("Bucket construct must include `state` property");
	if (!construct.reducers) throw new Error("Bucket construct must include `reducers` property");

	let hydrated = false;

	const getState = () => ({ ...struct.state });

	let devtools;
	const connectDevTools = (dt) => {
		devtools = dt;
		devtools.send({}, struct.state);

		return bucket;
	};

	const struct = {

		[Symbol.for('identity')]: identity,

		[Symbol.toStringTag]: 'WeirStruct',

		[priv]: {
			nodeBucket,
			propNodes: {},
			watchList: {},
			listeners: {},
		},

		state: {},

		triggerWatchers(propKey) {
			const watchers = struct[priv].watchList[propKey];
			if (watchers) watchers.forEach(fn => fn(struct.state[propKey]));
		},

		rehydrate() {
			const { listeners } = struct[priv];

			if (hydrated) return struct.state;

			Object.entries(construct.state).forEach(([propKey, propVal]) => {
				propVal = propVal.default || propVal;

				const node = nodeBucket.get(propKey);
				const watchers = new Set();
				struct[priv].watchList[propKey] = watchers;
				struct[priv].propNodes[propKey] = node;
				struct.state[propKey] = propVal;

				node.once(val => {
					struct.state[propKey] = val || propVal;
					node.put(val || propVal);
				});
				node.on((val, key, _, evt) => {
					struct.state[key] = val;
					watchers.forEach(fn => fn(key, val));
					// if we later need to remove the listener
					if (!listeners[propKey]) listeners[propKey] = evt;
				});
			});

			hydrated = true;

			return struct.state;
		},

		vacate() {
			Object.values(struct[priv].watchList).forEach(w=> w.clear());
			Object.values(struct[priv].listeners).forEach(l=> l.off());
			struct = null;
		},

		sub(propKey, listener) {
			struct[priv].watchList[propKey] = struct[priv].watchList[propKey] || new Set();
			struct[priv].watchList[propKey].add(listener);
		},

		unsub(propKey, listener) {
			struct[priv].watchList[propKey].delete(listener);
		},

		put(propKey, propVal) {
			const node = struct[priv].propNodes[propKey];
			if (!node) { console.warn(`No propKey match for '${propKey}'`); return; }
			node.put(propVal);
		}
	};

	const actionCreators = {};
	const bucketReducers = construct.reducers(getState);

	Object.keys(bucketReducers).forEach(reducerName => {
		const actionName = `${identity.description}::${reducerName}`;

		actionCreators[reducerName] = async (...args) => {
			const value = await bucketReducers[reducerName](...args);
			const newState = { ...struct.state, ...value };
			nodeBucket.put(newState);
			if (devtools && devtools.send) {
				devtools.send({ type: actionName, payload: args.slice(1) }, newState);
			}
		};
	});

	const bucket = {
		connectDevTools,
		actions: actionCreators,
		struct,
	};
	return bucket;
};

export default generic;
