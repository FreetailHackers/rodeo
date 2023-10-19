<script lang="ts">
	import type { Question } from '@prisma/client';
	import Plot from 'svelte-plotly.js';

	export let stats: Record<string, Record<string, number | [number, number]>>;
	export let questions: Question[];
	export let count: number;

	function frequencyToPieChartData(
		answerData: Record<string, number | [number, number]>
	): Partial<Plotly.PieData> {
		return {
			type: 'pie',
			labels: Object.keys(answerData),
			values: Object.values(answerData as Record<string, number>),
			textinfo: 'none',
		};
	}

	function frequencyToBoxPlotData(
		answerData: Record<string, number | [number, number]>
	): Partial<Plotly.BoxPlotData> {
		const data = Object.entries(answerData).flatMap(([response, frequency]) => {
			const numericResponse = Number(response);
			if (Number.isNaN(numericResponse)) {
				return [];
			} else {
				return Array.from({ length: frequency as number }, () => numericResponse);
			}
		});

		return {
			type: 'box',
			boxpoints: false,
			x: data,
			orientation: 'h',
			showlegend: false,
			name: '',
		};
	}

	function getWordFrequencyStatisticsMap(
		answerData: Record<string, number | [number, number]>,
		totalResponses: number
	) {
		return Object.entries(answerData as Record<string, [number, number]>)
			.map(([word, [totalFrequency, frequencyPerResponse]]) => ({
				word,
				totalFrequency,
				frequencyPerResponse,
				percentage: ((frequencyPerResponse / totalResponses) * 100).toFixed(2),
			}))
			.sort((a, b) => b.totalFrequency - a.totalFrequency);
	}
</script>

<details class="stats">
	<summary>User Statistics</summary>
	{#if Object.keys(stats).length === 0}
		<p>No statistics available.</p>
	{/if}
	{#each questions as question}
		{#if stats[question.id] !== undefined}
			<details>
				<summary class="question-label">{question.label}</summary>
				{#if question.type === 'NUMBER'}
					<div class="graph-container">
						<Plot
							data={[frequencyToBoxPlotData(stats[question.id])]}
							layout={{
								showlegend: false,
								margin: {
									t: 20,
									r: 50,
									b: 50,
									l: 20,
								},
							}}
							fillParent="width"
							debounce={250}
						/>
					</div>
				{:else if question.type === 'SENTENCE' || question.type === 'PARAGRAPH'}
					{@const sortedWords = getWordFrequencyStatisticsMap(stats[question.id], count)}
					<ol>
						{#each sortedWords as { word, totalFrequency, percentage }}
							<li>
								<strong>{word}</strong> - Appears {totalFrequency} times ({percentage}% of
								responses)
							</li>
						{/each}
					</ol>
				{:else}
					<div class="graph-container">
						<Plot
							data={[frequencyToPieChartData(stats[question.id])]}
							layout={{
								showlegend: true,
								legend: {
									orientation: 'h',
								},
								margin: {
									t: 20,
									r: 50,
									b: 50,
									l: 20,
								},
							}}
							fillParent={true}
							debounce={250}
						/>
					</div>
				{/if}
			</details>
		{/if}
	{/each}
</details>

<style>
	.stats {
		padding-top: 20px;
	}

	.graph-container {
		width: 100%;
		height: 300px;
		overflow: hidden;
	}

	.question-label {
		padding: 10px 20px;
	}
</style>
