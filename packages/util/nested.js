import isPlainObject from "lodash.isplainobject";
import entries from "lodash.topairs";
import merge from "lodash.merge";
import keys from "lodash.keys";
import isPrimitive from "./isprimitive";

const { isArray } = Array;

export const getPath = (src, curPath, nextProp) => {
    let pathNow = null;
    if (nextProp) {
        if (curPath) {
            pathNow = isArray(src) ? `${curPath}[${nextProp}]` : `${curPath}.${nextProp}`;
        } else {
            pathNow = isArray(src) ? `[${nextProp}]` : nextProp;
        }
    }
    return pathNow;
};
export const branchExpand = (path, leaf) => (
    path.replace(/^\[/, "").split(/[.[]/).reverse().reduce((merged, key) => {
        if (key.slice(-1) === "]") {
            const branch = [];
            const idx = parseInt(key.slice(0, -1), 10);
            branch[idx] = merged;
            return branch;
        }
        return { [key]: merged };
    }, leaf)
);
export const nestFlatten = (src, curPath) => {
    const result = {};
    keys(src).forEach((propKey) => {
        const newPath = getPath(src, curPath, propKey);
        const nextSrc = src[propKey];

        if (isPrimitive(nextSrc) || (!isPlainObject(nextSrc) && !isArray(nextSrc))) {
            result[newPath] = nextSrc;
        } else {
            merge(result, nestFlatten(nextSrc, newPath));
        }
    });
    return result;
};
export const nestExpand = (src) => {
    const result = keys(src)[0][0] === "[" ? [] : {};

    entries(src).forEach(([key, val]) => {
        merge(result, branchExpand(key, val));
    });
    return result;
};
