const path = require("path");

module.exports = [
	{
		entry: "./src/index.js",
		mode: "production",
		output: {
			library: "SimpleSharedState",
			libraryTarget: "umd",
			filename: "simple-shared-state.umd.js",
			path: path.resolve(__dirname, "dist"),
			globalObject: 'Function("return this")()',
		},
	},
];
