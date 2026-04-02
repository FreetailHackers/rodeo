<script lang="ts">
	import { Status } from '@prisma/client';
	import { onMount } from 'svelte';

	interface StatusCount {
		status: Status;
		count: number;
	}

	interface Props {
		statusCounts: StatusCount[];
	}

	let Plot: any = $state(null);

	onMount(async () => {
		Plot = (await import('svelte-plotly.js')).default;
	});

	let { statusCounts }: Props = $props();

	const statusColorMap: Record<Status, string> = {
		CREATED: 'lightgray',
		APPLIED: 'rgb(63, 63, 63)',
		ACCEPTED: 'rgb(93, 198, 93)',
		REJECTED: 'rgb(255, 78, 78)',
		WAITLISTED: 'orange',
		CONFIRMED: 'darkgreen',
		DECLINED: 'darkred',
	};

	const allStatuses: Status[] = Object.keys(Status) as Status[];

	let chartData = $derived(() => {
		const countMap = new Map(statusCounts.map((sc) => [sc.status, sc.count]));
		const statuses = allStatuses.filter((s) => (countMap.get(s) ?? 0) > 0);
		const counts = statuses.map((s) => countMap.get(s) ?? 0);
		const colors = statuses.map((s) => statusColorMap[s]);

		return [
			{
				x: statuses,
				y: counts,
				type: 'bar',
				marker: { color: colors },
				text: counts.map(String),
				textposition: 'outside',
			},
		];
	});

	let yMax = $derived(() => {
		const countMap = new Map(statusCounts.map((sc) => [sc.status, sc.count]));
		const counts = allStatuses.map((s) => countMap.get(s) ?? 0);
		const max = Math.max(...counts, 0);
		return Math.ceil(max * 1.15);
	});
</script>

<div class="chart-container">
	{#if Plot}
		<Plot
			data={chartData()}
			layout={{
				yaxis: { title: 'Count', range: [0, yMax()], autorange: false },
				xaxis: { title: 'Status' },
				margin: { t: 40, r: 20, b: 80, l: 50, pad: 5 },
				showlegend: false,
				barcornerradius: 4,
			}}
			fillParent="width"
			debounce={250}
		/>
	{/if}
</div>

<style>
	.chart-container {
		width: 100%;
		height: 350px;
		overflow: hidden;
	}
</style>
