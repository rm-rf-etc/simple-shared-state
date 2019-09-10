// import { stripDeep } from './util';
import reactWeirComponent from './react-weir';

export const funnel = (bucket, inputs, Component) => {
	let initialState = {};

	if (typeof Component !== 'function') {
		throw new Error(`\`bind\` expects a React component, but received ${typeof Component} instead.`);
	}

	return reactWeirComponent(Component, bucket, inputs, initialState);
};
