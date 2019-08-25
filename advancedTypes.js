import uuid from 'uuid/v1';
import { omit } from 'lodash';
import _intrnl, { events } from './internal';
const { isArray } = Array;

const advancedTypes = {
	stringified: {
		default: [],
		path: null,
		retrieve(subject) {
			const result = JSON.parse(subject);
			result.push = arrayMethodOverrides.push.bind(result);
			result.concat = arrayMethodOverrides.concat.bind(result);
			return result;
		},
		store(subject) {
			return JSON.stringify(subject);
		},
	},
	dimensional: {

		/*
		From a base index (which is a string extracted from the index Symbol), and a
		list of axes (an array of strings), we derive indices of the format
		`[base]/[axis](/[axis])*`. E.g. `BASE/X`, `BASE/X/Y`, `BASE/X/Y/Z`.

		We then read the value from `BASE`, expecting a semicolon-separated string
		of the derived indices previously stored from past sessions. If this string
		is different from our current derived indices string, then we null out all
		the old derived indices and store the new derived indices string at `BASE`.
		*/
		init(_default, { base, axes }) {
			const homeIndexStr = base.toUpperCase();
			const homeIndex = _intrnl.app.get(homeIndexStr);
			const derivedIndices = getDerivedIndicesFromAxes(homeIndexStr, axes);
			const derivedIndicesStr = derivedIndices.sort().join(';');

			homeIndex.once((record) => {
				if (record !== derivedIndicesStr) {
					if (typeof record === 'string') {
						record.split(';').forEach(i => _intrnl.app.get(i).put(null));
					}
					homeIndex.put(derivedIndicesStr);
				}
			});

			this.derivedIndices = derivedIndices.reduce((sum, index) => ({
				...sum,
				[index]: _intrnl.app.get(index),
			}), {});

			console.log('this advanced type', this);
		},
		default: 0,
		multiIndex: true,
		rehydrate(node) {
			console.log('rehydrate?', omit(node, '_'));
		},
		add(...args) {
			const d = args.length || 1;
		},
		store() {
			return 1;
		},
		retrieve() {
			return 1;
		},
	},
};

events.on('data_loaded', () => {
	Object.values(advancedTypes).forEach((type) => {
		if (!type.multiIndex) return;

		console.log('data_loaded', type);
		if (type.derivedIndices && Object.values(type.derivedIndices).length) {
			console.log('data loaded:', type.derivedIndices);
		}
	});
});

const arrayMethodOverrides = {
	push: function (object) {
		if (!object.uid) object.uid = uuid();
		Array.prototype.push.call(this, object);
		return this;
	},
	concat: function (array) {
		if (!isArray(array)) throw new Error('`concat` method of `stringified` type accepts only an Array');

		const copy = this.slice();

		array.forEach((item) => {
			if (isArray(item)) {
				throw new Error('`concat` method of `stringified` type does not support nested arrays');
			}
			if (!item || !item.constructor || item.constructor.name !== 'Object') {
				throw new Error('`concat` method of `stringified` type supports only plain object children');
			}
			return copy.push({ ...item, uid: item.uid || uuid() });
		});

		return copy;
	}
}

export default advancedTypes;

const getDerivedIndicesFromAxes = (baseStr, axesArray) => axesArray.reduce((sum, d) => ([
	...sum,
	`${sum.length ? sum.slice(-1) : baseStr}/${d.toUpperCase()}`,
]), []);
