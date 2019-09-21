import nodeRead from "weir.util/noderead";
import match from "weir.util/match";
import generic from "./generic";
import validIdentity from "./identity";

let weir;

export default ({
	namespace,
	publicRoot,
	privateRoot,
	reloadOnChange,
}) => {
	if (weir) return weir;

	weir = {
		appRoot: publicRoot.get(namespace),

		publicRoot,

		privateRoot,

		reloadOnChange,

		bucketsList: [],

		buckets: new Map(),

		connect: (buckets, devtools) => {
			[].concat(buckets).map((b) => b.connectDevTools(devtools));
		},

		bucket: (bucketDesc, construct) => {
			const identity = Symbol.for(bucketDesc);
			validIdentity(identity);

			const nodeBucket = match(
				[bucketDesc[0] === "G", () => weir.appRoot.get(bucketDesc)],
				[bucketDesc[0] === "L", () => weir.privateRoot.get(bucketDesc)],
			);

			const bucketWrapper = typeof construct === "function"
				? construct(identity, nodeBucket)
				: generic(construct, identity, nodeBucket);

			weir.bucketsList.push(identity.description);
			weir.buckets.set(identity, bucketWrapper);

			bucketWrapper.initialState = bucketWrapper.rehydrate();
			bucketWrapper.identity = identity;

			if (!weir.reloadOnChange) return bucketWrapper;

			const bucketsNode = weir.appRoot.get("@BUCKETS");
			const oldBuckets = nodeRead(bucketsNode);
			const newBuckets = weir.bucketsList.sort().join(":");

			if (oldBuckets === undefined) {
				bucketsNode.put(newBuckets);
			} else if (oldBuckets !== newBuckets) {
				localStorage.clear();
				bucketsNode.put(newBuckets);
				if (typeof window !== "undefined") window.location.reload();
			}

			return bucketWrapper;
		},
	};

	return weir;
};
