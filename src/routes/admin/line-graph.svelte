<script lang="ts">
	import type { StatusChange } from '@prisma/client';
	import Plot from 'svelte-plotly.js';
	export let fullEntry: StatusChange[];

	// Group data by specified interval (hours, days, weeks)
	function groupDataByInterval(interval: number) {
		return fullEntry.reduce((result: { [key: string]: { [key: string]: number } }, entry) => {
			const { newStatus, timestamp } = entry;
			const roundedTimestamp = new Date(Math.floor(timestamp.getTime() / interval) * interval);
			const timestampStr = roundedTimestamp.toISOString();
			if (!result[newStatus]) {
				result[newStatus] = {};
			}
			if (!result[newStatus][timestampStr]) {
				result[newStatus][timestampStr] = 1;
			} else {
				result[newStatus][timestampStr]++;
			}
			return result;
		}, {});
	}

	// Generate Plotly data arrays for specified interval
	function generatePlotlyData(interval: number) {
		const groupedData = groupDataByInterval(interval);
		return Object.keys(groupedData).map((newStatus) => {
			const timestamps = Object.keys(groupedData[newStatus]).sort(); // Sort timestamps
			const values = timestamps.map((ts) => groupedData[newStatus][ts]);

			return {
				x: timestamps,
				y: values,
				mode: 'lines',
				name: `${newStatus} (${interval / 3600000} hours)`,
			};
		});
	}

	let selectedInterval = 3600000; // Default: 1 hour
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
