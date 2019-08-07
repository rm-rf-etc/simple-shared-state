import * as React from 'react';
import Gun from 'gun/gun';
const { useRef, useReducer, useEffect } = React;

export const gun = Gun<StateShape>();

export type PrimitiveValue = number | string | boolean;
export type ChainRoot = typeof gun;
export type ChainNode = ReturnType<typeof gun.get>;
export type GenericDataType = {
	[k: string]: PrimitiveValue | GenericDataType | ChainRoot,
};
export type StateShape = {
	[k: string]: GenericDataType,
};
export interface SendProps extends React.Attributes {
	state: { [key: string]: any; };
	_root: ChainNode;
}

const reducer = (state: GenericDataType = {}, { prop, value }: { prop: string, value: PrimitiveValue }) => {
	if (state[prop] === value) { return state; }
	return { ...state, [prop]: value };
}

export const bind = (rootKey: string) => (Component: React.FC) => {

	if (typeof rootKey !== 'string') {
		throw new Error(`bind() requires a string for the root node key. Received ${typeof rootKey} instead.`)
	}
	if (typeof Component !== 'function') {
		throw new Error(`bind only works with function components, but received ${typeof Component} instead.`);
	}
	const _root = gun.get(rootKey);
	const args = getArgs(Component);

	return (ownProps: {}) => {

		const stateRef = useRef<{}>();
		const [state, dispatch] = useReducer(reducer, stateRef.current || {});
		stateRef.current = state;

		useEffect(() => {
			args.forEach((arg) => {
				_root.get(arg).on((value: any) => {
					dispatch({ prop: arg, value })
				})
			})
		}, [dispatch]);

		const props: SendProps = { ...ownProps, state, _root };
		return React.createElement(Component, props);
	};
}

export const getArgs = (fn: React.FC): string[] => {
	if (typeof fn !== 'function') { return []; }

	const args = fn
	.toString()
	.replace(/\n/g, '')
	.split(' => ')[0]
	.replace(/(\(\{|\}\)|\s)/g, '')
	.replace(/^.*gun\s*:\s*\{(.+)\}/, '$1')
	.replace(/=[^,]+/,'')
	.split(',');

	if (Array.isArray(args) && args.length < 1) {
		throw new Error(`No arguments found for component ${fn.name}`);
	}
	if (args.includes('_root')) {
		args.splice(args.indexOf('_root'), 1);
	}
	return args;
};
