const path = require("path");

module.exports = [
	{
		entry: "./src/index.js",
		mode: "production",
		output: {
			library: "SimpleSharedStateReact",
			libraryTarget: "umd",
			filename: "use-simple-shared-state.es6.umd.js",
			path: path.resolve(__dirname, "dist"),
			globalObject: 'Function("return this")()',
		},
	},
	{
		entry: "./src/index.js",
		mode: "production",
		output: {
			library: "SimpleSharedStateReact",
			libraryTarget: "umd",
			filename: "simple-shared-state.es5.umd.js",
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
