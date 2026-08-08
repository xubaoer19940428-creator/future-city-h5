export default {
	plugins: {
		tailwindcss: {},
		'postcss-pxtorem': {
			rootValue: 16,
			unitPrecision: 6,
			propList: ['*'],
			replace: true,
			mediaQuery: false,
			minPixelValue: 2,
			exclude: /node_modules/i,
		},
		autoprefixer: {},
	},
}
