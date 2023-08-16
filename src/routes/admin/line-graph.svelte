<script lang="ts">
	import type { StatusChange } from '@prisma/client';
	import Plot from 'svelte-plotly.js';
	export let fullEntry: StatusChange[];

	var statuses = [
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

	// Get all unique timestamps
	function getSortedTimeStamps(groupedData: { [key: string]: { [key: string]: string } }) {
		const timestamps = new Set();
		Object.values(groupedData).forEach((statusData) => {
			Object.keys(statusData).forEach((timestamp) => {
				timestamps.add(timestamp);
			});
		});
		// All unique timestamps
		const sortedTimestamps = Array.from(timestamps).sort();
		return sortedTimestamps;
	}

	// Depending on the interval (minutely, hourly...), group data
	function groupDataByInterval(interval: number) {
		// [key is userId] : { [key is timestamp] : [key is status] }
		const groupedData: { [key: string]: { [key: string]: string } } = {};

		fullEntry.forEach((entry) => {
			const { newStatus, timestamp, userId } = entry;
			const roundedTimestamp = new Date(Math.floor(timestamp.getTime() / interval) * interval);
			const timestampStr = roundedTimestamp.toISOString();

			if (!groupedData[userId]) {
				groupedData[userId] = {};
			}

			if (!groupedData[userId][timestampStr]) {
				groupedData[userId][timestampStr] = newStatus;
			}

			// if multiple status in single timestamp, choose the one with higher index
			if (groupedData[userId][timestampStr]) {
				const index1 = statuses.indexOf(groupedData[userId][timestampStr]);
				const index2 = statuses.indexOf(newStatus);
				if (index1 >= index2) {
					groupedData[userId][timestampStr] = statuses[index1];
				} else if (index1 < index2) {
					groupedData[userId][timestampStr] = statuses[index2];
				} else {
					groupedData[userId][timestampStr] = newStatus;
				}
			}
		});
		return groupedData;
	}

	// Give accumulitive sum of statuses for each timestamp
	// For example, if a user is accepted at 1:00, the proceeding timestamps will
	// have 1 count for accepted until the next status change
	function polishData(interval: number) {
		const groupedData = groupDataByInterval(interval);
		// [key is status] : array of counts with index corresponding to timestamp
		const polishedData: { [key: string]: number[] } = {};
		const sortedTimestamps = getSortedTimeStamps(groupedData);

		for (const user in groupedData) {
			let previousStatus = 'N/A';
			let previousIndex = -1;
			for (const time in groupedData[user]) {
				const index = sortedTimestamps.findIndex((timestamp) => timestamp === time);
				if (previousStatus != 'N/A' && !polishedData[previousStatus]) {
					polishedData[previousStatus] = new Array(sortedTimestamps.length).fill(0);
				}
				if (previousIndex != -1 && previousStatus != 'N/A') {
					for (let i = previousIndex; i < index; i++) {
						polishedData[previousStatus][i]++;
					}
				}
				previousIndex = index;
				previousStatus = groupedData[user][time];
			}

			if (!polishedData[previousStatus]) {
				polishedData[previousStatus] = new Array(sortedTimestamps.length).fill(0);
			}
			for (let i = previousIndex; i < sortedTimestamps.length; i++) {
				polishedData[previousStatus][i]++;
			}
		}

		return [polishedData, sortedTimestamps] as const;
	}

	function generatePlotlyData(interval: number) {
		const [polishedData, sortedTimestamps] = polishData(interval);
		const plotlyData = [];

		for (const status in polishedData) {
			const plotlyDatum = {
				x: sortedTimestamps,
				y: polishedData[status],
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
			x: sortedTimestamps,
			y: sortedTimestamps.map((timestamp, i) => {
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

	let selectedInterval = 3600000; // Default hourly interval
	let plotlyData = generatePlotlyData(selectedInterval);

	// Function to change interval and update data
	function changeInterval(interval: number) {
		selectedInterval = interval;
		plotlyData = generatePlotlyData(interval);
	}
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

<div>
	<button on:click={() => changeInterval(60000)}>Minutely</button>
	<button on:click={() => changeInterval(3600000)}>Hourly</button>
	<button on:click={() => changeInterval(86400000)}>Daily</button>
	<button on:click={() => changeInterval(604800000)}>Weekly</button>
</div>
