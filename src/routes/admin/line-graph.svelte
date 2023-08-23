<script lang="ts">
	import type { StatusChange, Status } from '@prisma/client';
	import Plot from 'svelte-plotly.js';
	export let fullEntry: StatusChange[];

	var statuses: Status[] = [
		'CREATED',
		'VERIFIED',
		'APPLIED',
		'ACCEPTED',
		'REJECTED',
		'WAITLISTED',
		'CONFIRMED',
		'DECLINED',
	];

	var statusColorMap = new Map<string, string>([
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
		fullEntry.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
		console.log(fullEntry);
		// [key is status] : array of counts with index corresponding to timestamp
		const polishedData: Record<Status, number[]> = {
			CREATED: [0],
			VERIFIED: [0],
			APPLIED: [0],
			ACCEPTED: [0],
			REJECTED: [0],
			WAITLISTED: [0],
			CONFIRMED: [0],
			DECLINED: [0],
		};
		// [key is status] : Set of userIds
		const userStatuses: { [key: string]: Set<string> } = {};
		const timestamps = [];

		timestamps.push(fullEntry[0].timestamp);

		for (var i = 0; i < fullEntry.length; i++) {
			const { newStatus, timestamp, userId } = fullEntry[i];
			timestamps.push(timestamp);

			statuses.forEach((status) => {
				if (!userStatuses[status]) {
					userStatuses[status] = new Set();
				}
				if (userStatuses[status].has(userId)) {
					userStatuses[status].delete(userId);
				}
			});

			userStatuses[newStatus].add(userId);
			statuses.forEach((status) => {
				polishedData[status].push(userStatuses[status].size);
			});
		}

		timestamps.sort((a, b) => a.getTime() - b.getTime());
		return [polishedData, timestamps] as const;
	}

	function generatePlotlyData() {
		const [polishedData, timestamps] = polishData();
		const plotlyData = [];

		for (const status in polishedData) {
			const plotlyDatum = {
				x: timestamps,
				y: polishedData[status as Status],
				mode: 'lines',
				name: status,
				line: {
					color: statusColorMap.get(status),
				},
			};
			plotlyData.push(plotlyDatum);
		}

		// TOTAL line
		const totalLine = {
			x: timestamps,
			y: timestamps.map((timestamp, i) => {
				return Object.values(polishedData).reduce((sum, statusArray) => sum + statusArray[i], 0);
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
		xaxis: { title: 'Time Interval' },
		yaxis: { title: 'Count' },
		legend: {
			font: {
				size: 10,
			},
		},
		autosize: false,
		width: 800,
		height: 400,
		margin: {
			t: 20,
			r: 0,
			b: 80,
			l: 50,
			pad: 5,
		},
	}}
	fillParent="width"
	debounce={250}
/>
