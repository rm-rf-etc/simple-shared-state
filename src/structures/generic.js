const priv = Symbol('inaccessible');

const generic = (construct, identity, nodeBucket) => {
	if (!construct.properties) throw new Error("Bucket construct must have `properties`");

	let hydrated = false;

	const struct = {

		[Symbol.for('identity')]: identity,

		[Symbol.toStringTag]: 'SubstrateStructure',

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

			Object.entries(construct.properties).forEach(([propKey, propVal]) => {
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
				node.on((val, key, _, chain) => {
					struct.state[key] = val;
					watchers.forEach(fn => fn(key, val));
					// if we later need to remove the listener
					if (!listeners[propKey]) listeners[propKey] = chain;
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

	return {
		methods: construct.methods && construct.methods(struct),
		struct,
	};
};

export default generic;
