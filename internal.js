
let INTERNAL_STORE = {};

const _internal = {
	get read () {
		return INTERNAL_STORE;
	},
	set write (val) {
		INTERNAL_STORE = val;
	},
};

export default _internal;
