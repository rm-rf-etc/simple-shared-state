const path = require("path");

module.exports = [
	{
		entry: "./src/index.js",
		mode: "production",
		output: {
			library: "useSharedState",
			libraryTarget: "umd",
			filename: "use-shared-state.es6.umd.js",
			path: path.resolve(__dirname, "dist"),
			globalObject: 'Function("return this")()',
		},
	},
	{
		entry: "./src/index.js",
		mode: "production",
		output: {
			library: "useSharedState",
			libraryTarget: "umd",
			filename: "use-shared-state.es5.umd.js",
			path: path.resolve(__dirname, "dist"),
			globalObject: 'Function("return this")()',
		},
		module: {
			rules: [
				{
					test: /\.m?js$/,
					exclude: /(node_modules)/,
					use: {
						loader: "babel-loader",
						options: {
							presets: ["@babel/preset-env"],
						}
					}
				}
			]
		}
	},
];
