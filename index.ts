import * as React from 'react';
import Gun from 'gun/gun';
// import 'gun/lib/open';
// import 'gun/lib/load';
// import 'gun/lib/unset';
// const gun = Gun(['http://localhost:7700/gun']);
// (window as any).gun = gun;
const { useRef, useReducer, useEffect } = React;

export const gun = Gun<StateShape>();
const discardNode = gun.get('');
export type ChainNode = typeof discardNode;

export type ReactClassComponent = React.ElementType & React.Component & { boundProps: any } & React.FC;
export type PrimitiveValue = number | string | boolean;
export type ChainRoot = typeof gun;

export type CommonChain = ChainRoot | ChainNode;

export type RootNodeShape = {
	[k: string]: PrimitiveValue;
};
export type StateShape = {
	[k: string]: RootNodeShape;
};
export interface SendProps extends React.Attributes {
	state: { [key: string]: PrimitiveValue; };
	$: ChainNode;
}

const reducer = (state: RootNodeShape = {}, { prop, value }: { prop: string, value: PrimitiveValue }) => {
	if (state[prop] === value) { return state; }
	return { ...state, [prop]: value };
}

export const bind = (rootKey: string) => (Component: ReactClassComponent) => {

	if (typeof rootKey !== 'string') {
		throw new Error(`bind() requires a string for the root node key. Received ${typeof rootKey} instead.`)
	}
	if (typeof Component !== 'function') {
		throw new Error(`bind only works with function components, but received ${typeof Component} instead.`);
	}
	const _root = gun.get(rootKey);

	if (Component.hasOwnProperty('boundProps')) {
		console.log('boundProps', Component.boundProps);
	}
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

		const props: SendProps = { ...ownProps, state, $: _root };
		return React.createElement(Component, props);
	};
}

export const getArgs = (fn: React.ElementType): string[] => {
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
