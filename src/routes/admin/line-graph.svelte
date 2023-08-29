<script lang="ts">
	import type { StatusChange } from '@prisma/client';
	import { Status } from '@prisma/client';
	import Plot from 'svelte-plotly.js';
	export let statusChanges: StatusChange[];

	const statuses: Status[] = Object.keys(Status) as Status[];

	const statusColorMap = new Map<Status, string>([
		['CREATED', 'lightgray'],
		['VERIFIED', 'rgb(135, 135, 135)'],
		['APPLIED', 'rgb(63, 63, 63)'],
		['ACCEPTED', 'rgb(93, 198, 93)'],
		['REJECTED', 'rgb(255, 78, 78)'],
		['WAITLISTED', 'orange'],
		['CONFIRMED', 'darkgreen'],
		['DECLINED', 'darkred'],
	]);

	// Track statusChange for every timestamp in all status changes recorded
	function polishData() {
		// [key is status] : array of counts with index corresponding to timestamp

		const polishedData: Record<Status, number[]> = Object.fromEntries(
			statuses.map((status) => [status, [0]])
		) as Record<Status, number[]>;

		// [key is status] : Set of userIds
		const userStatuses = new Map<Status, Set<string>>();

		for (const status of statuses) {
			userStatuses.set(status, new Set());
		}
		const timestamps = [];

		timestamps.push(statusChanges[0].timestamp);

		for (let entry of statusChanges) {
			const { newStatus, timestamp, userId } = entry;
			timestamps.push(timestamp);

			statuses.forEach((status) => {
				if (userStatuses.get(status)!.has(userId)) {
					userStatuses.get(status)!.delete(userId);
				}
			});

			userStatuses.get(newStatus)!.add(userId);
			statuses.forEach((status) => {
				polishedData[status].push(userStatuses.get(status)!.size);
			});
		}
		return polishedData;
	}

	function generatePlotlyData() {
		const polishedData = polishData();
		const timestamps = Array.prototype.map.call(
			statusChanges,
			(entry: StatusChange) => entry.timestamp
		);
		const plotlyData = [];

		for (const status in polishedData) {
			const plotlyDatum = {
				x: timestamps,
				y: polishedData[status as Status],
				mode: 'lines',
				name: status,
				line: {
					color: statusColorMap.get(status as Status),
				},
			};
			plotlyData.push(plotlyDatum);
		}

		// TOTAL line
		const totalLine = {
			x: timestamps,
			y: timestamps.map((timestamp, i) => {
				return Object.values(polishedData).reduce((sum, status) => sum + status[i], 0);
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

	let plotlyData = generatePlotlyData();
</script>

<Plot
	data={plotlyData}
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
