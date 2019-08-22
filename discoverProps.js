// const { isArray } = Array;

// const discoverProps = (fn) => {
// 	if (typeof fn !== 'function') {
// 		return [];
// 	}

// 	let fnStr = fn.toString();

// 	let args;
// 	if (/['"]@state['"]\s*:/) {
// 		args = extractComponentArgs(fnStr);
// 	} else {
// 		args = extractMinifiedComponentArgs(fnStr);
// 	}
// 	// if (/react__|var _ref\$State|_ref\['@state'\][,.]/g.test(fnStr)) {

// 	if (isArray(args) && args.length < 1) {
// 		throw new Error(`No arguments found for component ${fn.name}`);
// 	}

// 	return args;
// };

// const extractComponentArgs = (fnStr) => {
// 	try {
// 		return (/['"]@state['"]:\{([^}]*)\}/)
// 			.exec(fnStr.replace(/[\n\s]/g, ''))[1]
// 			.split(',')
// 			.map((str) => str.split('=')[0]);
// 	} catch (err) {
// 		console.log(err);
// 		console.log('ƒ:', fnStr);
// 	}
// 	return [];
// };

// const extractMinifiedComponentArgs = (fnStr) => {
// 	const block = /function \w*\(_ref\)\s*\{(.+?)return/si.exec(fnStr);
// 	const lines = block[1].trim().replace(/[,;]?\n/, ';').split(/[,;]/);
// 	const args = [];

// 	let pushing = false;
// 	for (let line of lines) {
// 		if (pushing) {
// 			args.push(line.replace(/\s+/g, '').split('=')[0]);
// 		}
// 		if (/@state/.test(line)) {
// 			pushing = true;

// 			const parsed = /@state['"]\]\.(\w+);$/.exec(line);
// 			if (parsed) {
// 				args.push(parsed[1]);
// 			}
// 		} else if (/@methods/.test(line)) {
// 			pushing = false;
// 		}
// 	}

// 	return args;
// };

// export default discoverProps;
