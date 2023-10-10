/**
 * This script deletes all but a set number of the last successful
 * preview and production deployments for a Vercel project. This can be
 * useful if, say, you find a security vulnerability and want to purge
 * all deployments that might have been affected.
 *
 * Usage: ts-node cleanup-vercel.ts <# of deployments to keep> [--yes]
 * Example: ts-node cleanup-vercel.ts 10 --yes
 *
 * This will delete all but the last 10 successful preview deployments
 * and the last 10 successful production deployments. The optional --yes
 * flag skips the confirmation prompt, which can be useful in a CI/CD
 * pipeline.
 *
 * You must set the VERCEL_PROJECT_ID and VERCEL_TOKEN environment
 * variables to use this script.
 */
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// How many of the latest successful deployments to keep, each for preview and production
if (process.argv[2] === undefined) {
	throw new Error('You must specify how many deployments to keep.');
}
const LATEST_TO_KEEP = parseInt(process.argv[2]);
if (LATEST_TO_KEEP < 1) {
	throw new Error('You must keep at least one deployment!');
}

async function getDeployments() {
	if (process.env.VERCEL_PROJECT_ID === undefined || process.env.VERCEL_PROJECT_ID.trim() === '') {
		throw new Error('VERCEL_PROJECT_ID is not defined');
	}
	if (process.env.VERCEL_TOKEN === undefined || process.env.VERCEL_TOKEN.trim() === '') {
		throw new Error('VERCEL_TOKEN is not defined');
	}

	const data = await fetch(
		'https://api.vercel.com/v6/deployments?' +
			new URLSearchParams({
				projectId: process.env.VERCEL_PROJECT_ID,
				limit: '1000',
			}),
		{
			headers: {
				Authorization: 'Bearer ' + process.env.VERCEL_TOKEN,
			},
			method: 'get',
		}
	);
	const deployments = (await data.json()).deployments;
	return deployments.sort((a: any, b: any) => a.created - b.created);
}

async function deleteDeployments(deployments: string[]) {
	for (const deployment of deployments) {
		await fetch(`https://api.vercel.com/v6/deployments/${deployment}`, {
			headers: {
				Authorization: 'Bearer ' + process.env.VERCEL_TOKEN,
			},
			method: 'delete',
		});
	}
}

function formatDeployment(deployment: any) {
	return `${deployment.url} | ${new Date(deployment.created)
		.toISOString()
		.replace('T', ' ')
		.slice(0, -8)} | ${deployment.state} | ${deployment.target ?? 'preview'}`;
}

const deployments = await getDeployments();
// Delete all unsuccessful deployments
const toDelete = deployments.filter(
	(deployment: any) => deployment.state === 'ERROR' || deployment.state === 'CANCELED'
);
// Delete all but last LATEST_TO_KEEP successful preview and production deployments
toDelete.push(
	...deployments
		.filter((deployment: any) => deployment.state === 'READY' && deployment.target !== 'production')
		.slice(0, -LATEST_TO_KEEP)
);
toDelete.push(
	...deployments
		.filter((deployment: any) => deployment.state === 'READY' && deployment.target === 'production')
		.slice(0, -LATEST_TO_KEEP)
);

// Display what will be deleted and what will be kept
console.log('The following deployments will be deleted:');
console.log();
for (const deployment of toDelete) {
	console.log(formatDeployment(deployment));
}
console.log();
console.log('The following deployments will be kept:');
console.log();
for (const deployment of deployments.filter((deployment: any) => !toDelete.includes(deployment))) {
	console.log(formatDeployment(deployment));
}

console.log();
if (process.argv[3] === '--yes') {
	await deleteDeployments(toDelete.map((deployment: any) => deployment.url));
	console.log('Deleted ' + toDelete.length + ' deployments.');
} else {
	const rl = readline.createInterface({ input, output });
	const answer = await rl.question('Confirm deletion (y/n)? ');
	if (answer === 'y') {
		await deleteDeployments(toDelete.map((deployment: any) => deployment.url));
		console.log('Deleted ' + toDelete.length + ' deployments.');
	} else {
		console.log('Aborted.');
	}
	rl.close();
}
