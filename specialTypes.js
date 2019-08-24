import uuid from 'uuid/v1';
import { omit } from 'lodash';
import _intrnl, { events } from './internal';
const { isArray } = Array;

const specialTypes = {
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
		default: 0,
		path: '__schematype_dimensional__',
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
	Object.values(specialTypes).forEach((type) => {
		if (!type.path) return;
		_intrnl.app.get(type.path).once((data) => type.rehydrate(data));
	})
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

export default specialTypes;
