import EventEmitter from 'eventemitter3';
const { isArray } = Array;

const _INTERNAL_ = {};

const env = process.env.DEVELOPMENT || 'development';

const indicesToString = (obj) => Object.keys(obj).sort().join(',');

const forExport = {

	get indices () {
		return _INTERNAL_.indices;
	},
	get gun () {
		return _INTERNAL_.gun;
	},
	get app () {
		return _INTERNAL_.app;
	},
	init(gun, app, indices) {
		const _indices = (typeof indices === 'object') ?
			Object.values(indices) :
			indices;

		if (!isArray(_indices)) {
			throw new Error('Invalid indices received');
		}
		if (_indices.some(i => typeof i !== 'symbol')) {
			throw new Error('Invalid index type found, indices must be Symbols');
		}

		_INTERNAL_.gun = gun;
		_INTERNAL_.app = app;

		_INTERNAL_.indices = _indices.reduce((sum, symbol) => {
			if (typeof symbol !== 'symbol') {
				throw new Error('An index can only be defined as a symbol');
			}
			const symbolName = getSymbolValue(symbol);

			if (!/^[A-Z0-9:-_/]+$/.test(symbolName)) {
				throw new Error(`Invalid index string content: '${symbolName}'`);
			}
			return { ...sum, [symbolName]: symbol };
		}, {});

		console.log('_INTERNAL_.indices', _INTERNAL_.indices);

		if (env === 'development') {
			app.get('_indices_').once((oldIndices) => {
				const newIndices = indicesToString(_INTERNAL_.indices);
				if (oldIndices !== newIndices) {
					localStorage.clear();
					app.get('_indices_').put(newIndices);
					window.location.reload();
				}
			});
		}

		console.log('emit');
		events.emit('data_loaded');
	},
};

export default forExport;
export const events = new EventEmitter();
export const getIndex = (str) => _INTERNAL_.indices[str];
export const getSymbolValue = (sym) => /^Symbol\((.+)\)$/.exec(sym.toString())[1];
