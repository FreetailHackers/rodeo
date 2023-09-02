<script lang="ts">
	import Graph from './line-graph.svelte';
	import Plot from 'svelte-plotly.js';

	export let data;

	type PieChartData = {
		labels: string[];
		values: number[];
		type: 'pie';
	};

	function getPieChartData(questionData: {
		label: string;
		pairs: [string, number][];
	}): PieChartData {
		const labels = questionData.pairs.map((pair) => pair[0]);
		const values = questionData.pairs.map((pair) => pair[1]);

		const pieData: PieChartData = {
			labels: labels,
			values: values,
			type: 'pie',
		};

		return pieData;
	}
</script>

<svelte:head>
	<title>Rodeo | Admin - Statistics</title>
</svelte:head>

<label for="statusChangeText"><h2>User Status Count Over Time</h2></label>
<Graph statusChanges={data.graph} />

{#each data.questionsData as questionData}
	<label for="category"><h2>{questionData.label}</h2></label>
	<Plot
		data={[getPieChartData(questionData)]}
		layout={{
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
{/each}
