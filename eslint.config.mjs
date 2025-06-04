import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import pluginSvelte from 'eslint-plugin-svelte';

export default [
	{
		ignores: [
			'.DS_Store',
			'node_modules/**',
			'build/**',
			'.svelte-kit/**',
			'package/**',
			'.env',
			'.env.*',
			'!.env.example',
			'pnpm-lock.yaml',
			'package-lock.json',
			'yarn.lock',
			'cleanup-vercel.ts',
			'*.cjs',
		],
	},
	js.configs.recommended,
	{
		files: ['*.ts', '*.tsx'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				project: './tsconfig.json',
				tsconfigRootDir: new URL('.', import.meta.url).pathname,
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': 'error',
		},
	},
	{
		files: ['*.svelte'],
		languageOptions: {
			parser: pluginSvelte.parser,
		},
		rules: {
			...pluginSvelte.configs['flat/recommended'].rules,
			'svelte/require-each-key': 'error',
			'svelte/no-unused-svelte-ignore': 'error',
		},
	},
	{
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
		},
		rules: {
			eqeqeq: 'error',
			'no-undef': 'off',
		},
	},
];
