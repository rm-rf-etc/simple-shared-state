import React, { useRef, useReducer, useEffect, useCallback } from 'react';
import Gun from 'gun/gun';
import 'gun/lib/open';
import 'gun/lib/load';
import 'gun/lib/unset';

let gun;
let _intrnl = {};
const { isArray } = Array;

export const getData = (rootName) => (
	_intrnl.app ? _intrnl.app.get(rootName) : null
);

export class DataInitializer extends React.PureComponent {

	componentWillMount() {
		// console.log('PROVIDER: willMount()');
		const {
			peers,
			options,
			root: rootName,
		} = this.props;

		gun = Gun(peers, options);
		_intrnl = {
			app: gun.get(rootName),
			gun,
		};
	}

	render() {
		// console.log('PROVIDER: render()', );
		// console.log('gun is initialized:', !!_intrnl.app);
		return this.props.children;
	}
};

export const _reducer = (state, { prop, value }) => {
	if (state[prop] === value) { return state; }
	return { ...state, [prop]: value };
};

export const _getArgs = (fn) => {
	if (typeof fn !== 'function') { return []; }

	const fnStr = fn.toString().replace(/[\n\s]/g, '');
	const args = (/['"]@state['"]:\{([^\}]*)\}/)
		.exec(fnStr)[1]
		.split(',')
		.map((str) => str.split('=')[0]);

	if (isArray(args) && args.length < 1) {
		throw new Error(`No arguments found for component ${fn.name}`);
	}

	return args;
};

export const bind = (rootKey, setMethods) => (Component) => {

	if (typeof rootKey !== 'string') {
		throw new Error(`bind() requires a string for the root node key. Received ${typeof rootKey} instead.`)
	}
	if (typeof Component !== 'function') {
		throw new Error(`bind expects a React component, but received ${typeof Component} instead.`);
	}

	let args = [];
	if (Component.prototype && Component.prototype.isReactComponent) {
		if (!isArray(Component.boundProps)) {
			throw new Error('`boundProps` not found. Did you forget `static`?');
		}
		args = Component.boundProps;
	} else {
		args = _getArgs(Component);
	}
	// console.log('bind:', rootKey);

	return (ownProps) => {
		const stateRef = useRef();
		const methodsRef = useRef();
		const getState = useCallback(() => stateRef.current, []);
		const [state, dispatch] = useReducer(_reducer, stateRef.current || {});
		stateRef.current = state;

		useEffect(() => {
			args.forEach((arg) => {
				node.get(arg).on((value) => {
					dispatch({ prop: arg, value });
				});
			});
		}, [dispatch]);

		if (!_intrnl.app) return null;
		const node = _intrnl.app.get(rootKey);

		if (!methodsRef.current) {
			const defaultMethods = {
				get: node.get,
				put: (prop, val) => node.get(prop).put(val),
			};
			if (setMethods) {
				methodsRef.current = setMethods(getState, defaultMethods);
			} else {
				methodsRef.current = defaultMethods;
			}
		}

		return React.createElement(Component, {
			...ownProps,
			'@state': state,
			'@methods': methodsRef.current,
		});
	};
};
