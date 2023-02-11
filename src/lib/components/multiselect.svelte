<script lang="ts">
	export let options: string[];
	export let name: string;
	export let label: string;
	export let required = false;
	export let value: string[];
</script>

<label for={name}>{label}</label>
<select {required} bind:value id={name} {name} multiple size={options.length}>
	{#each options as option}
		<option value={option} selected={value.includes(option)}>{option}</option>
	{/each}
</select>

<style>
	select {
		padding: 0.5rem;
		height: initial;
	}
</style>
