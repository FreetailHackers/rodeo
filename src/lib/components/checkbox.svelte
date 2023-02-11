<script lang="ts">
	export let name: string;
	export let label: string;
	export let required = false;
	export let checked: boolean;
</script>

<div>
	<input type="checkbox" bind:checked id={name} {name} {required} />
	<label for={name}>{label}</label>
</div>

<style>
	input {
		height: initial;
		width: initial;
	}
</style>
