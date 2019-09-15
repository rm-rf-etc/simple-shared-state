import uuid from 'uuid/v1';

const structures = {
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
};

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
};
