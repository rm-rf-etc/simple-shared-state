import { createElement, useReducer, useEffect } from 'react';
import { zipObjectDeep, merge, isFunction } from 'lodash';
import { stripDeep, match } from '../util';
const { isArray } = Array;

const reducer = (state, { propKey, propVal }) => {
    let newState = {
        ...state,
    };

    if (typeof propKey === "string" && propKey.match(/\./)) {
        const branch = zipObjectDeep([propKey], [propVal]);
        merge(newState, branch);
    } else {
        newState[propKey] = propVal;
    }

    return newState;
};

const HOC = (Component, bucket, inputs, initialState) => (ownProps) => {
    const [state, dispatch] = useReducer(reducer, initialState || {});
    console.log('RENDER:', JSON.stringify(state));

    useEffect(() => {
        if (!bucket || !bucket.struct) return;
        const { struct } = bucket;

        inputs.forEach((key) => {
            struct.sub(key, (path, val) => dispatch({
                propKey: path,
                propVal: stripDeep(val),
            }));
        });

        return struct.vacate;
    }, [bucket]);

    return createElement(Component, {
        ...ownProps,
        bucketMethods: bucket && bucket.methods || {},
        bucketState: state,
    });
};

export default (bucket, a, b) => {
    let initialState = {};
    const [inputs, Component] = match(
        [isArray(a) && isFunction(b), () => ([a, b])],
        [isFunction(a) && isArray(b), () => ([b, a])],
        [true, () => ([null, null])],
    );

    if (typeof Component !== 'function') {
        throw new Error(`\`bind\` expects a React component, but received ${typeof Component} instead.`);
    }

    return HOC(Component, bucket, inputs, initialState);
};
