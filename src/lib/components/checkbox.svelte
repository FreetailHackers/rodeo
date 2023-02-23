<script lang="ts">
	export let name: string;
	export let label: string;
	export let required = false;
	export let checked: boolean | null;
	export let link = '';
</script>

<div>
	<input type="checkbox" bind:checked id={name} {name} {required} />
	<label for={name}>
		{#if link !== ''}
			<a href={link} target="_blank" rel="noreferrer"> {label} </a>
		{:else}
			{label}
		{/if}
		{#if required} * {/if}
	</label>
</div>

<style>
	input {
		height: initial;
		width: initial;
	}
</style>
