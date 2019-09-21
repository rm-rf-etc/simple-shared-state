import nodeRead from "weir.util/noderead";
import match from "weir.util/match";
import mt from "weir.util/microtask";
import omit from "lodash.omit";
import range from "lodash.range";
import cProduct from "cartesian-product";

const { isArray } = Array;
const priv = Symbol("inaccessible");

const dimensional = ({ space, actions }) => (identity, nodeBucket) => {
	if (!isArray(space) || !space.length) {
		throw new Error("Dimensional structure received invalid `space` definition");
	}
	if (space.some((d) => !isValidAxisName(d[0]))) {
		throw new Error("At least one axis name is invalid, must match pattern /^[A-Z0-9-_]+$/");
	}

	nodeRead(nodeBucket);
	const nodeRoot = nodeBucket.back(-1);

	const dimensionsBefore = nodeRead(nodeBucket.get("dimensions"));
	const dimensionsNow = space.map((d) => d[0]).join();
	const spaceNow = JSON.stringify(space);

	nodeBucket.put({
		space: spaceNow,
		dimensions: dimensionsNow,
	});
	if (dimensionsBefore && dimensionsBefore !== dimensionsNow) {
		localStorage.clear();
		if (typeof window !== "undefined") window.location.reload();
	}

	let hydrated = false;
	const watchList = {};
	const nodeTags = nodeBucket.get("tags");
	const derivedTags = deriveTags(space);
	// const allTag = `_${space.map(() => "$").join("_")}`;

	const struct = {

		[Symbol.for("identity")]: identity,

		[Symbol.toStringTag]: "WeirStruct",

		[priv]: { nodeTags },

		derivedTags,

		state: {},

		get axes() {
			return space.map((a) => a[0]);
		},

		get(...coords) {
			return actions.getState(...coords);
		},

		// set(coords, value) {
		// 	// if (!isArray(coords)) coords = [coords];
		// 	// if (!validCoords(coords, space)) throw new Error("Invalid coordinates");

		// 	// const nodeNew = nodeTags.get(allTag).set(value);

		// 	// const pattern = coords.reduce((sum, n) => {
		// 	// 	if (typeof n === "number") {
		// 	// 		return `${sum}_${n}`;
		// 	// 	} if (isNaN(n) || n === null || n === undefined) {
		// 	// 		return `${sum}_$`;
		// 	// 	}
		// 	// 	return sum;
		// 	// }, "");

		// 	// const node = nodeTags.get(coords);
		// 	// if (node) node.set(value);
		// },

		// extend(axis, value) {
		// 	// if (!struct.axes.includes(axis)) {
		// 	// 	throw new Error(`Could not find axis: "${axis}"`);
		// 	// }
		// 	// const idx = space.findIndex(a => a[0] === axis);
		// 	// space[idx][1]++;

		// 	// console.log(space, value);

		// 	// nodeTags.once(oldTags => {
		// 	// 	const newTags = deriveTags(space).filter(newTag => oldTags[newTag] === undefined);

		// 	// 	newTags.forEach(newTag => {
		// 	// 		nodeTags.get(newTag).set(value || _default);
		// 	// 	});
		// 	// });
		// },

		vacate() {
			/* eslint-disable-next-line no-console */
			console.log("CLEANUP CALLED");
		},

		// select(queryFn) {
		// 	// console.log("state", struct.state);

		// 	// const list = Object.values(nodeTags).map(many => Object.values(many)).flat();

		// 	// const resultTags = list.filter(queryFn);

		// 	// console.log("resultTags", resultTags);

		// 	// resultTags.forEach(tag => struct.state.add(tag));

		// 	// const stateArray = [...struct.state];
		// 	// struct[priv].watchList.forEach(fn => fn(stateArray));
		// },

		getState(...args) {
			// fill coords with wild card if empty
			const coords = `_${space.map((_, idx) => args[idx] || "$")}`;

			return validCoords(coords, space)
				? struct.state[`_${coords.join("_")}`]
				: null;
		},

		rehydrate() {
			if (hydrated) return struct.state;

			struct.derivedTags.forEach((tag) => {
				const nodeList = nodeTags.get(tag);
				nodeList.once(addEventListener(tag));
				nodeList.on(addEventListener(tag));
			});

			hydrated = true;
			return struct.state;
		},

		populate(tag) {
			const list = watchList[tag];
			if (!list || !list.size) return;
			list.forEach((fn) => fn(tag, struct.state[tag]));
		},

		sub(tag, listener, populate = true) {
			watchList[tag] = watchList[tag] || new Set();
			watchList[tag].add(listener);

			if (!populate) return;
			mt(() => listener(tag, struct.state[tag]));
		},

		unsub(tag, listener) {
			const list = watchList[tag];
			if (list && list.size) list.delete(listener);
		},
	};

	function addEventListener(tag) {
		// if needed, initialize list on state as empty object
		struct.state[tag] = struct.state[tag] || {};
		const watchers = watchList[tag];

		// console.log(`watchers for tag "${tag}"`, watchers);
		return (data1) => {
			if (!data1) return;
			const keys = Object.keys(omit(data1, "_"));
			if (!keys.length) return;

			keys.forEach((soul) => nodeRoot.get(soul).once((data2) => {
				struct.state[tag][soul] = data2;

				const path = `${tag}.${soul}`;
				const content = typeof data2 === "object" ? omit(data2, "_") : data2;
				const notify = (key) => (fn) => fn(key, content);

				if (watchList[path] && watchList[path].size) {
					mt(() => watchList[path].forEach(notify(soul)));
				}
				if (watchers && watchers.size) {
					mt(() => watchers.forEach(notify(path)));
				}
			}));
		};
	}

	return {
		actions: actions(struct),
		struct,
	};
};

// takes [null, 0], returns "_$_0"
export function n2s(val) {
	return match(
		[isNaN(val), () => "_$"],
		[typeof val === "number", () => `_${val}`],
		[val === null || val === undefined, () => "_$"],
	);
}
// takes [["X", 2], ["Y", 3]], returns [[1,2], [1,2,3]]
export function axesExpand(axes) {
	return axes.map(([, L]) => range(0, L).concat("$"));
}
export function deriveTags(axes) {
	return cProduct(axesExpand(axes)).map((row) => row.map(n2s).join(""));
}
export function validCoords(coords, def) {
	const space = def.map((s) => s[1]);
	return space.length >= coords.length && !coords.some((c, id) => c > space[id]);
}
export function isValidAxisName(str) {
	return /^[A-Z0-9-_]+$/.test(str);
}

export default dimensional;
