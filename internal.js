
let _internal = {};

export default {
	get read () {
		return _internal;
	},
	set write (val) {
		_internal = val;
	},
};
