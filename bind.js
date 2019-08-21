import { createElement, useRef, useState, useEffect, useCallback } from 'react';
import { omit } from 'lodash';
import getStateProps from './discoverProps';
import _intrnl from './internal';
// import _reducer from './reducer';
const { isArray } = Array;

export default (rootKey, setMethods, schema) => (Component) => {

	if (!['string', 'object'].includes(typeof rootKey)) {
		throw new Error(`bind() requires a string or object with id property for root_key. Received ${typeof rootKey} instead.`)
	}
	if (typeof Component !== 'function') {
		throw new Error(`bind expects a React component, but received ${typeof Component} instead.`);
	}

	let stateProps = [];
	if (typeof Component !== 'function') {
		throw new Error('`bind` received invalid component.');
	}
	if (Component.boundProps && isArray(Component.boundProps)) {
		if (Component.boundProps.length < 1) {
			console.warn('`bind` received component with empty list of boundProps.');
			return null;
		}
		stateProps = Component.boundProps;
	} else {
		stateProps = getStateProps(Component);
	}
	if (stateProps.length < 1) {
		throw new Error('State props could not be found');
	}
	stateProps.forEach((propKey) => {
		if (!schema.hasOwnProperty(propKey)) {
			throw new Error(`Schema failed validation, property key '${propKey}' found in your component but not in your schema.`);
		}
	});

	let initialState = {};

	Object.entries(schema).forEach(([propKey, propSchema]) => {
		const specialType = specialTypes[propSchema.type];

		initialState[propKey] = specialType ? specialType.store(propSchema.default) : propSchema.default;
	});
	// console.log('bind:', rootKey);

	return (ownProps) => {
		const methodsRef = useRef();
		const schemaRef = useRef(schema);
		const stateRef = useRef(initialState);

		/*
		Because we only process methods once, we have to provide a means to get the current
		state within those methods. `getState` will return the most recent state object, generated
		from the reducer. `getState` expects a prop
		*/
		const getState = useCallback((propKey) => {
			const state = stateRef.current;
			const schema = schemaRef.current;

			if (!schema.hasOwnProperty(propKey)) {
				throw new Error(`Property '${propKey}' not available from your pre-defined schema`);
			}

			const statePiece = state[propKey];
			const type = schema[propKey] ? schema[propKey].type : null;

			return type && specialTypes[type] ? specialTypes[type].retrieve(statePiece) : statePiece;
		}, []);

		const [state, setState] = useState(stateRef.current || initialState);
		stateRef.current = state;


		/*
		One-time setup process. Adds node property listeners and sets default node property values.
		*/
		useEffect(() => {

			node.once((nodeData) => {
				const content = omit(nodeData, '_');
				const objProps = Object.values(content).filter(p => p.hasOwnProperty('#'));

				if (objProps.length) {
					const objPromises = {};
					Object.entries(content).map(([propKey, propVal]) => {
						objPromises[propKey] = _intrnl.read.gun.get(propVal['#']).then();
					});

					Promise.all(Object.values(objPromises)).then(d => {
						const newState = d.map(d => omit(d, '_'));

						console.log('newState', newState);
						// setState(newState);
					});
				}

				// setState({
				// 	...stateRef.current,
				// 	...omit(nodeData, '_'),
				// });
			});

			/*
			For the current property, load the associated developer-provided schema.
			Using this schema, check if it's a special type, and if so, use that
			special type to `put` the default value.
			*/
			stateProps.forEach((propKey) => {

				// a gun db reference for this property of our active node
				const nodeProp = node.get(propKey);

				nodeProp.put(initialState[propKey]);
				nodeProp.on(propVal => setState({ [propKey]: propVal }));
			});
		}, [setState]);


		/*
		If rootKey is an object with property `id`, then node lookup needs to happen
		from above the application root, because gun ID's are global.

		gun.get('jsdk24ys')
		vs
		gun.get('app_root').get('node_name')
		*/
		const { id } = rootKey;
		const node = (id ? _intrnl.read.gun : _intrnl.read.app).get(id || rootKey);


		/*
		Methods from our developer should be processed only once. But this needs to
		be synchronous and happen before render, so we can't do this in useEffect.
		*/
		if (!methodsRef.current) {

			const defaultMethods = {
				get: node.get,
				put: (propKey, val) => {
					const specialType = getSpecial(propKey, schema);
					node.get(propKey).put(specialType ? specialType.store(val) : val);
				},
			};

			methodsRef.current = setMethods
				? setMethods(getState, defaultMethods)
				: defaultMethods;
		}

		return createElement(Component, {
			...ownProps,
			'@state': convertForRender(state, schema),
			'@methods': methodsRef.current,
		});
	};
};

// alt+B: ∫
// alt+O: ø
const specialTypes = {
	stringified: {
		default: [],
		retrieve(subject) {
			return JSON.parse(subject);
		},
		store(subject) {
			return JSON.stringify(subject);
		},
	}
};

const convertForRender = (state, schema) => {
	let result = {};

	for (let k in state) {
		const propSchema = schema[k];
		const sType = specialTypes[propSchema.type];

		result[k] = sType ? sType.retrieve(state[k]) : state[k];
	}

	return result;
};

const getSpecial = (propKey, schema) => {
	const propSchema = schema[propKey];
	return specialTypes[propSchema.type];
};
