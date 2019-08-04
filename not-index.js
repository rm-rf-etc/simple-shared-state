const React = require('react');
const { useRef, useReducer, useEffect } = React;

const reducer = (state = {}, { prop, value }) => {
	if (state[prop] === value) { return state; }
	return { ...state, [prop]: value };
}

const bind = (_root) => (Component) => {

	if (typeof _root !== 'object' || _root.constructor.name !== 'Gun') {
		throw new Error(`bind expects Gun reference but received ${typeof _root} instead.`)
	}
	if (typeof Component !== 'function') {
		throw new Error(`bind only works with function components, but received ${typeof Component} instead.`);
	}
	const args = getArgs(Component);

	return (props) => {

		const stateRef = useRef();
		const [state, dispatch] = useReducer(reducer, stateRef.current || {});
		stateRef.current = state;

		useEffect(() => {
			args.forEach((arg) => {
				_root.get(arg).on((value) => {
					dispatch({ prop: arg, value })
				})
			})
		}, [dispatch]);

		return React.createElement(
			Component,
			{ gun: { ...state, _root }, ...props },
		);
	};
}

export const getArgs = (fn) => {
	if (typeof fn !== 'function') { return null; }

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

export default bind;
