const bucketRegex = /^(GLOBAL|LOCAL)\.[A-Z0-9-_]+$/;

export const validIdentity = (sym) => {
	if (typeof sym !== 'symbol' || Symbol.for(sym.description) !== sym) {
		throw new Error("Invalid identity, use `Symbol.for('...')`");
	}
	if (!bucketRegex.test(sym.description)) {
		throw new Error(`Identity description must match pattern ${bucketRegex.toString()}`);
	}
	return true;
};
