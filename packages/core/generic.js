import strip from "weir.util/deepomit";
import entries from "lodash.topairs";
import values from "lodash.values";
import merge from "lodash.merge";
import keys from "lodash.keys";

export default (construct, identity, nodeBucket) => {
	if (!construct.state) throw new Error("Bucket construct must include `state` property");
	if (!construct.reducers) throw new Error("Bucket construct must include `reducers` property");

	const privateData = {
		nodeBucket,
		propNodes: {},
		watchList: {},
		listeners: {},
		state: {},
	};
	let hydrated = false;

	const getState = () => privateData.state;
	const getStateProp = (propKey) => privateData.state[propKey];
	const getStateProps = (propKeys) => propKeys.reduce((merged, k) => ({
		...merged,
		[k]: privateData.state[k],
	}), {});

	let devtools;
	const actions = {};
	const bucketReducers = construct.reducers({ getState, getStateProp, getStateProps });

	keys(bucketReducers).forEach((reducerName) => {
		const actionName = `${identity.description}::${reducerName}`;

		actions[reducerName] = async (...args) => {
			const stateChange = await bucketReducers[reducerName](...args);

			nodeBucket.put(stateChange);
			if (devtools && devtools.send) {
				devtools.send({ type: actionName, payload: args.slice(1) }, privateData.state);
			}
		};
	});

	const struct = {
		[Symbol.for("identity")]: identity,
		[Symbol.toStringTag]: "WeirStruct",
		actions,
		getState,
		getStateProp,
		getStateProps,
		initialState: construct.state,
		reducers: construct.reducers,
		watchListRequired: true,

		setListeners: (watchList, fn) => {
			watchList.forEach((key) => struct.sub(key, fn));
		},

		connectDevTools: (dt) => {
			devtools = dt;
			devtools.send({}, privateData.state);

			return struct;
		},

		triggerWatchers(propKey) {
			const watchers = privateData.watchList[propKey];
			if (watchers) watchers.forEach((fn) => fn(privateData.state[propKey]));
		},

		rehydrate() {
			if (hydrated) return privateData.state;

			entries(construct.state).forEach(([propKey, propValDefault]) => {
				const propVal = propValDefault.default || propValDefault;

				const node = nodeBucket.get(propKey);
				const watchers = new Set();
				privateData.watchList[propKey] = watchers;
				privateData.propNodes[propKey] = node;
				privateData.state[propKey] = propVal;

				node.once((val) => {
					const newVal = val || propVal;
					if (typeof newVal === "object") {
						merge(privateData.state[propKey], newVal);
					} else {
						privateData.state[propKey] = newVal;
					}
					node.put(newVal);
				});
				node.open((val, key, _, evt) => {
					privateData.state[key] = strip(val);
					watchers.forEach((fn) => fn(key, val));
					// if we later need to remove the listener
					if (!privateData.listeners[propKey]) privateData.listeners[propKey] = evt;
				});
			});

			hydrated = true;

			return privateData.state;
		},

		vacate() {
			values(privateData.watchList).forEach((w) => w.clear());
			values(privateData.listeners).forEach((l) => l.off());
		},

		sub(propKey, listener) {
			privateData.watchList[propKey] = privateData.watchList[propKey] || new Set();
			privateData.watchList[propKey].add(listener);
		},

		unsub(propKey, listener) {
			privateData.watchList[propKey].delete(listener);
		},

		put(propKey, propVal) {
			const node = privateData.propNodes[propKey];
			/* eslint-disable-next-line no-console */
			if (!node) { console.warn(`No propKey match for '${propKey}'`); return; }
			node.put(propVal);
		},
	};

	return struct;
};
