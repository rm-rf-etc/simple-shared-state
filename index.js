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

export class Data extends React.PureComponent {

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

export const scan = (Component) => {
	Component.boundProps = getArgs(Component);
	return Component;
};

export const bind = (rootKey, setMethods) => (Component) => {

	if (!['string', 'object'].includes(typeof rootKey)) {
		throw new Error(`bind() requires a string or object with id property for root_key. Received ${typeof rootKey} instead.`)
	}
	if (typeof Component !== 'function') {
		throw new Error(`bind expects a React component, but received ${typeof Component} instead.`);
	}

	let args = [];
	if (typeof Component !== 'function') {
		throw new Error('`bind` received invalid component.');
	}
	if (Component.boundProps && isArray(Component.boundProps)) {
		if (Component.boundProps.length < 1) {
			console.warn('`bind` received component with empty list of boundProps.');
			return null;
		}
		args = Component.boundProps;
	} else {
		args = getArgs(Component);
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
		const { id } = rootKey;
		const node = (id ? _intrnl.gun : _intrnl.app).get(id || rootKey);

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

export const _reducer = (state, { prop, value }) => {
	if (state[prop] === value) return state;
	return {
		...state,
		[prop]: value,
	};
};

const extractMinifiedComponentArgs = (fnStr) => {
	const block = /function \w*\(_ref\)\s*\{(.+?)return/si.exec(fnStr);
	const lines = block[1].trim().replace(/[,;]?\n/, ';').split(/[,;]/);
	const args = [];

	let pushing = false;
	for (let line of lines) {
		if (pushing) {
			args.push(line.replace(/\s+/g, '').split('=')[0]);
		}
		if (/@state/.test(line)) {
			pushing = true;

			const parsed = /@state['"]\]\.(\w+);$/.exec(line);
			if (parsed) {
				args.push(parsed[1]);
			}
		} else if (/@methods/.test(line)) {
			pushing = false;
		}
	}

	return args;
};

const extractComponentArgs = (fnStr) => {
	try {
		return (/['"]@state['"]:\{([^}]*)\}/)
			.exec(fnStr.replace(/[\n\s]/g, ''))[1]
			.split(',')
			.map((str) => str.split('=')[0]);
	} catch (err) {
		console.log(err);
		console.log('ƒ:', fnStr);
	}
	return [];
};

export const getArgs = (fn) => {
	if (typeof fn !== 'function') {
		return [];
	}

	let fnStr = fn.toString();

	let args;
	if (/react__|var _ref\$State|_ref\['@state'\][,.]/g.test(fnStr)) {
		args = extractMinifiedComponentArgs(fnStr);
	} else {
		args = extractComponentArgs(fnStr);
	}

	if (isArray(args) && args.length < 1) {
		throw new Error(`No arguments found for component ${fn.name}`);
	}

	return args;
};
