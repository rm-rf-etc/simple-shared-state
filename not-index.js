const React = require('react');
const e = React.createElement;

const _tables = new Map();

const reducer = (state = {}, { prop, value }) => {
	if (state[prop] === value) { return state; }
	return { ...state, [prop]: value };
}

const bind = (_root) => (Component) => {

	_tables.set(_root, _tables.get(_root) || {
		listeners: {},
		state: {},
	});
	const _table = _tables.get(_root);

	if (typeof _root !== 'object' || _root.constructor.name !== 'Gun') {
		throw new Error(`bind expects Gun reference but received ${typeof _root} instead.`)
	}
	if (typeof Component !== 'function') {
		throw new Error(`bind only works with function components, but received ${typeof Component} instead.`);
	}
	const args = getArgs(Component);

	return (props) => {

		let [state, dispatch] = React.useReducer(reducer, _table.state);
		_table.dispatch = dispatch;
		_table.state = state;

		args.forEach((arg) => {
			let _listener = _table.listeners[arg];

			if (_listener) { return; }

			_listener = (value) => {
				_table.dispatch({ prop: arg, value });
			};
			_root.get(arg).on(_listener);

			_table.listeners[arg] = _listener;
		});

		return e(
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
