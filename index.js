import React from 'react';
import Gun from 'gun/gun';
import 'gun/lib/open';
import 'gun/lib/load';
import 'gun/lib/unset';
const { useRef, useReducer, useEffect } = React;

let _intrnl = {};
const { isArray } = Array;

export const getData = (rootName) => (
	_intrnl.app ? _intrnl.app.get(rootName) : null
);

export const DataInitializer = ({
		children,
		peers,
		root: rootName,
	}) => {

	const gun = Gun(peers);

	_intrnl = {
		app: gun.get(rootName),
		gun,
	};

	return children;
};


export const _reducer = (state, { prop, value }) => {
	if (state[prop] === value) { return state; }
	return { ...state, [prop]: value };
}

export const _getArgs = (fn) => {
	if (typeof fn !== 'function') { return []; }

	const fnStr = fn.toString().replace(/[\n\s]/g, '');
	const args = (/['"]@state['"]:\{([^\}]*)\}/)
		.exec(fnStr)[1]
		.split(',')
		.map((str) => str.split('=')[0]);

	if (Array.isArray(args) && args.length < 1) {
		throw new Error(`No arguments found for component ${fn.name}`);
	}

	return args;
};

export const bind = (rootKey, methods) => (Component) => {

	if (typeof rootKey !== 'string') {
		throw new Error(`bind() requires a string for the root node key. Received ${typeof rootKey} instead.`)
	}
	if (typeof Component !== 'function') {
		throw new Error(`bind only works with function components, but received ${typeof Component} instead.`);
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

	return (ownProps) => {
		if (!_intrnl.app) { return null; }
		const node = _intrnl.app.get(rootKey);

		const stateRef = useRef();
		const [state, dispatch] = useReducer(_reducer, stateRef.current || {});
		stateRef.current = state;

		useEffect(() => {
			args.forEach((arg) => {
				node.get(arg).on((value) => {
					dispatch({ prop: arg, value });
				});
			});
		}, [dispatch]);

		const defaultMethods = {
			get: node.get,
			put: (prop, val) => node.get(prop).put(val),
		};
		console.log('recalculate');

		return React.createElement(Component, {
			...ownProps,
			'@state': state,
			'@methods': methods ? methods(state, defaultMethods) : defaultMethods,
		});
	};
};
