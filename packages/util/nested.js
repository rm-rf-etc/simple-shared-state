import keys from "lodash.keys";
import merge from "lodash.merge";
import entries from "lodash.topairs";

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
    keys(src).forEach((nextProp) => {
        const newPath = getPath(src, curPath, nextProp);
        if (typeof src[nextProp] !== "object") {
            // eslint-disable-next-line no-param-reassign
            result[newPath] = src[nextProp];
        } else {
            merge(result, nestFlatten(src[nextProp], newPath));
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
