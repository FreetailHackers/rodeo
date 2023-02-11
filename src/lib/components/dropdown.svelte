<script lang="ts">
	export let options: string[];
	export let name: string;
	export let label: string;
	export let required = false;
	export let value: string | null;
</script>

<label for={name}>{label}</label>
<select bind:value id={name} {name} {required}>
	{#each options as option}
		<option value={option}>{option}</option>
	{/each}
</select>

<style>
	option {
		text-transform: capitalize;
	}

	select {
		margin-bottom: 1rem;
	}
</style>
