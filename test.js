const fn = `
function IndexPage(_ref) {
  var _ref$State = _ref['@state'],
      display_title = _ref$State.display_title,
      page_title = _ref$State.page_title,
      meta_data = _ref$State.meta_data,
      url = _ref$State.url,
      rows = _ref$State.rows,
      put = _ref['@methods'].put;
return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null,
`;

const block = /function \w+\(_ref\) \{(.+)return/si.exec(fn);
const lines = block[1].trim().replace(/[,;]?\n/, ';').split(/[,;]/);
const args = [];

let pushing = false;
for (let line of lines) {
	if (pushing) {
		args.push(line.replace(/\s+/g, '').split('=')[0]);
	}
	if (/@state/.test(line)) {
		pushing = true;

		const parsed = /@state['"]\]\.(\w+)\;$/.exec(line);
		if (parsed) {
			args.push(parsed[1]);
		}
	} else if (/@methods/.test(line)) {
		pushing = false;
	}
}

console.log('state args', args);
