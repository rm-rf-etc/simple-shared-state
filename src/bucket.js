import weir from "./weir";
import generic from "./structures/generic";
import { validIdentity } from "./identity";
import { match, nodeRead } from "./util";

export default (bucketDesc, construct) => {
    const identity = Symbol.for(bucketDesc);
    validIdentity(identity);

    const bucketNode = match(
        [bucketDesc.match(/^G/), () => weir.app.get(bucketDesc)],
        [bucketDesc.match(/^L/), () => weir.private.get(bucketDesc)],
    );

    const bucketWrapper = typeof construct === "function" ?
        construct(identity, bucketNode) :
        generic(identity, bucketNode, construct);

    const filledBucket = {
        identity,
        ...bucketWrapper,
    };

    weir.bucketsList.push(identity.description);
    weir.buckets.set(identity, bucketWrapper.struct);

    filledBucket.initialState = bucketWrapper.struct.rehydrate();

    if (document.env !== "development") return filledBucket;

    const bucketsNode = weir.app.get("[BUCKETS]");
    const oldBuckets = nodeRead(bucketsNode);
    const newBuckets = weir.bucketsList.sort().join(",");

    if (oldBuckets === undefined) {
        bucketsNode.put(newBuckets);
    } else if (oldBuckets !== newBuckets) {
        localStorage.clear();
        bucketsNode.put(newBuckets);
        typeof window !== 'undefined' && window.location.reload();
    }

    return filledBucket;
};
