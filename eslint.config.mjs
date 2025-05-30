// eslint.config.mjs
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import pluginSvelte from 'eslint-plugin-svelte';

export default [
	// — Global ignore patterns (replaces .eslintignore)
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

	// — 1) Core JS recommended
	js.configs.recommended,

	// — 2) TS files override
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
		// ← here is the plugin mapping that was missing
		plugins: {
			'@typescript-eslint': tsPlugin,
		},
		rules: {
			// spread in all the plugin’s “recommended” rules
			...tsPlugin.configs.recommended.rules,
			// (and you can override or add more here)
			'@typescript-eslint/no-unused-vars': 'error',
		},
	},

	// — 3) Svelte flat “recommended”
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

	// — 4) Your remaining JS rules
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
