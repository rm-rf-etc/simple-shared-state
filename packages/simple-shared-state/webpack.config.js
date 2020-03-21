const path = require("path");

module.exports = [
	{
		entry: "./src/index.ts",
		mode: "production",
		resolve: {
			extensions: [".tsx", ".ts", ".js", ".json"],
		},
		output: {
			library: "SimpleSharedState",
			libraryTarget: "umd",
			filename: "simple-shared-state.es6.umd.js",
			path: path.resolve(__dirname, "dist"),
			globalObject: 'Function("return this")()',
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: ["ts-loader"],
					exclude: /node_modules/,
				},
			]
		}
	},
	{
		entry: "./src/index.ts",
		mode: "production",
		resolve: {
			extensions: [".tsx", ".ts", ".js", ".json"],
		},
		output: {
			library: "SimpleSharedState",
			libraryTarget: "umd",
			filename: "simple-shared-state.es5.umd.js",
			path: path.resolve(__dirname, "dist"),
			globalObject: 'Function("return this")()',
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: ["ts-loader"],
					exclude: /node_modules/,
				},
				{
					test: /\.m?js$/,
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
	{
		entry: "./src/merge.ts",
		mode: "production",
		resolve: {
			extensions: [".tsx", ".ts", ".js", ".json"],
		},
		output: {
			library: "merge",
			libraryTarget: "umd",
			filename: "merge.js",
			path: path.resolve(__dirname, "test_bundle"),
			globalObject: 'Function("return this")()',
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: ["ts-loader"],
					exclude: /node_modules/,
				},
				{
					test: /src\/merge.js$/,
					exclude: /.*/,
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
