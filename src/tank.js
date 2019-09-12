import tap from "./react/bind";
import generic from "./structures/generic";
import { validIdentity } from "./identity";
import { match, nodeRead } from "./util";

let tank;

export default ({ namespace, publicRoot, privateRoot, reloadOnChange }) => {
	if (tank) return tank;

	tank = {

		appRoot: publicRoot.get(namespace),

		publicRoot,

		privateRoot,

		reloadOnChange,

		bucketsList: [],

		buckets: new Map(),

		bucket: (bucketDesc, construct) => {
			const identity = Symbol.for(bucketDesc);
			validIdentity(identity);

			const nodeBucket = match(
				[bucketDesc[0] === "G", () => tank.appRoot.get(bucketDesc)],
				[bucketDesc[0] === "L", () => tank.privateRoot.get(bucketDesc)],
			);

			const bucketWrapper = typeof construct === "function" ?
				construct(identity, nodeBucket) :
				generic(construct, identity, nodeBucket);

			const filledBucket = {
				identity,
				...bucketWrapper,
				tap: (a, b) => tap(filledBucket, a, b),
			};

			tank.bucketsList.push(identity.description);
			tank.buckets.set(identity, bucketWrapper.struct);

			filledBucket.initialState = bucketWrapper.struct.rehydrate();

			if (!tank.reloadOnChange) return filledBucket;

			const bucketsNode = tank.appRoot.get("[BUCKETS]");
			const oldBuckets = nodeRead(bucketsNode);
			const newBuckets = tank.bucketsList.sort().join(",");

			if (oldBuckets === undefined) {
				bucketsNode.put(newBuckets);
			} else if (oldBuckets !== newBuckets) {
				localStorage.clear();
				bucketsNode.put(newBuckets);
				typeof window !== 'undefined' && window.location.reload();
			}

			return filledBucket;
		}
	};

	return tank;
};
