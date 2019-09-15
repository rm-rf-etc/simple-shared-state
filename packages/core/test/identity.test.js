const { validIdentity } = require('../identity');

describe('Symbol handling', () => {
	it('uniqueness recognizes new symbols with the same description', () => {
		expect(validIdentity(Symbol.for('GLOBAL.BUCKET'))).toBe(true);
		expect(validIdentity(Symbol.for('LOCAL.BUCKET'))).toBe(true);
		expect(() => validIdentity(Symbol('LOCAL.BUCKET'))).toThrow();
	});
});
