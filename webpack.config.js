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
	{
		entry: "./src/index.js",
		mode: "production",
		output: {
			library: "SimpleSharedState",
			libraryTarget: "umd",
			filename: "simple-shared-state-ie-compat.umd.js",
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
							plugins: ["@babel/plugin-transform-object-assign"]
						}
					}
				}
			]
		}
	},
];
