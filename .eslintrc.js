module.exports = {
	root: true,
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	globals: {
		dd: true,
		wx: 'writable',
	},
	extends: [
		'plugin:@typescript-eslint/recommended',
		'eslint:recommended',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		quotes: ['error', 'single'], // 使用单引号
		eqeqeq: 'error', // 使用 '==='
		// 'no-trailing-spaces': 'error', // 去掉多余空格
		'default-case': 'error', // case default
		'no-unused-vars': 'off',
		'prettier/prettier': 'error',
	},
};
