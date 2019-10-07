import { branchExpand } from "weir.util/nested";
import values from "lodash.values";
import strip from "weir.util/deepomit";
import keys from "lodash.keys";
// import merge from "lodash.merge";

const { isArray } = Array;
const isFn = (fn) => typeof fn === "function";

class List {
	map(cb) {
		return keys(this).map((k) => cb(this[k], k));
	}

	forEach(cb) {
		keys(this).forEach((k) => cb(this[k], k));
	}

	at(idx) {
		return values(this)[idx];
	}
}

export default (construct) => (identity, nodeBucket) => {
	if (!construct.state) throw new Error("Bucket construct must include `state` property");
	if (!isArray(construct.state)) throw new Error("Bucket `state` for SimpleList must be an array");

	const privateData = {
		nodeBucket,
		propNodes: {},
		watchList: new Set(),
		listeners: {},
		state: new List(),
	};
	let hydrated = false;

	const getState = () => privateData.state;
	const getStateProp = (propKey) => privateData.state[propKey];

	let devtools;
	const actions = {};
	if (construct.reducers) {
		const bucketReducers = construct.reducers({ getState, getStateProp });

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
	}

	const struct = {
		[Symbol.for("identity")]: identity,
		[Symbol.toStringTag]: "WeirStruct",
		actions,
		getState,
		getStateProp,
		reducers: construct.reducers,
		watchListRequired: false,

		setListeners: (_, fn) => {
			struct.sub(fn);
		},

		connectDevTools: (dt) => {
			devtools = dt;
			devtools.send({}, privateData.state);

			return struct;
		},

		triggerWatchers(propKey) {
			const watchers = privateData.watchList;
			if (watchers) watchers.forEach((fn) => fn(privateData.state[propKey]));
		},

		rehydrate() {
			if (hydrated) return privateData.state;

			construct.state.forEach((propVal) => {
				const node = nodeBucket.set(propVal);
				const soul = node._.get;
				// eslint-disable-next-line no-param-reassign
				propVal.id = soul;

				privateData.propNodes[soul] = node;
				privateData.state[soul] = propVal;

				node.once((val, thisSoul) => {
					const newVal = val || propVal;
					newVal.id = thisSoul;
					privateData.state[thisSoul] = newVal;
					node.put(newVal);
				});
				node.open((val, thisSoul, _, evt) => {
					/*
					WRITE EVENT HANDLER
					console.log("OPEN", val);
					*/
					privateData.state[thisSoul] = strip(val);
					privateData.watchList.forEach((fn) => isFn(fn) && fn(val.id, val));
					// if we later need to remove the listener
					if (!privateData.listeners[thisSoul]) privateData.listeners[thisSoul] = evt;
				});
			});

			hydrated = true;

			return privateData.state;
		},

		vacate() {
			values(privateData.watchList).forEach((w) => w.clear());
			values(privateData.listeners).forEach((l) => l.off());
		},

		sub(listener) {
			privateData.watchList = privateData.watchList || new Set();
			privateData.watchList.add(listener);
		},

		unsub(listener) {
			privateData.watchList.delete(listener);
		},

		put(propPath, propVal) {
			const stateChange = branchExpand(propPath, propVal);
			nodeBucket.put(stateChange);
			/* eslint-disable-next-line no-console */
			// if (!node) { console.warn(`No propKey match for '${propKey}'`); return; }
			// node.put(propVal);
		},
	};

	return struct;
};
