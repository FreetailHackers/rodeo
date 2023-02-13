import { sveltekit } from '@sveltejs/kit/vite';
import { promisify } from 'util';
import { exec } from 'child_process';

// Get current tag/commit and last commit date from git
const pexec = promisify(exec);
let [release, build, timestamp] = (
	await Promise.allSettled([
		pexec('git describe --tags || git rev-parse --short HEAD'),
		pexec('git rev-parse --short HEAD'),
		pexec('git log -1 --format=%cd --date=format:"%Y-%m-%d %H:%M"'),
	])
).map((v) => JSON.stringify(v.value?.stdout.trim()));

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
	resolve: {
		alias: {
			'.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js',
		},
	},
	define: {
		__RELEASE__: release,
		__BUILD__: build,
		__TIMESTAMP__: timestamp,
	},
};

export default config;
