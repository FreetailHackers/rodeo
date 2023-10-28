<script lang="ts">
	import type { StatusChange } from '@prisma/client';
	import { Status } from '@prisma/client';
	import Plot from 'svelte-plotly.js';
	export let statusChanges: StatusChange[];
	const statuses: Status[] = Object.keys(Status) as Status[];
	const statusColorMap = new Map<Status, string>([
		['CREATED', 'lightgray'],
		['APPLIED', 'rgb(63, 63, 63)'],
		['ACCEPTED', 'rgb(93, 198, 93)'],
		['REJECTED', 'rgb(255, 78, 78)'],
		['WAITLISTED', 'orange'],
		['CONFIRMED', 'darkgreen'],
		['DECLINED', 'darkred'],
	]);

	// Track statusChange for every timestamp in all status changes recorded
	function statusChangesToStatusCounts(statusChanges: StatusChange[]) {
		// [key is status] : array of counts with index corresponding to timestamp

		const statusCounts: Record<Status, number[]> = Object.fromEntries(
			statuses.map((status) => [status, [0]])
		) as Record<Status, number[]>;

		// [key is status] : Set of userIds
		const userStatuses = new Map<Status, Set<string>>();

		for (const status of statuses) {
			userStatuses.set(status, new Set());
		}

		for (let entry of statusChanges) {
			const { newStatus, userId } = entry;

			statuses.forEach((status) => {
				if (userStatuses.get(status)?.has(userId)) {
					userStatuses.get(status)?.delete(userId);
				}
			});

			userStatuses.get(newStatus)?.add(userId);
			statuses.forEach((status) => {
				statusCounts[status].push(userStatuses.get(status)?.size ?? 0);
			});
		}
		return statusCounts;
	}

	function generateStatusCountHistory(statusCounts: Record<Status, number[]>) {
		const timestamps = [
			statusChanges[0]?.timestamp,
			...statusChanges.map((statusChange) => statusChange.timestamp),
		];

		const plotlyData = Object.keys(statusCounts).map((status) => {
			const plotlyDatum = {
				x: timestamps,
				y: statusCounts[status as Status],
				mode: 'lines',
				name: status,
				line: {
					color: statusColorMap.get(status as Status),
				},
			};
			return plotlyDatum;
		});

		// TOTAL line
		const totalLine = {
			x: timestamps,
			y: timestamps.map((timestamp, i) => {
				return Object.values(statusCounts).reduce((sum, statusCount) => sum + statusCount[i], 0);
			}),
			mode: 'lines',
			name: 'TOTAL',
			line: {
				color: '#bf5700',
				width: 4,
			},
		};

		plotlyData.push(totalLine);
		return plotlyData;
	}
</script>

<div class="graph-container">
	<Plot
		data={generateStatusCountHistory(statusChangesToStatusCounts(statusChanges))}
		layout={{
			xaxis: { title: 'Time' },
			yaxis: { title: 'User Count' },
			showlegend: false,
			margin: {
				t: 20,
				r: 0,
				b: 80,
				l: 50,
				pad: 5,
			},
			hovermode: 'x unified',
			hoverdistance: -1,
		}}
		fillParent="width"
		debounce={250}
	/>
</div>

<style>
	.graph-container {
		width: 100%;
		height: 300px;
		overflow: hidden;
	}
</style>
