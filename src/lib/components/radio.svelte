<script lang="ts">
	export let choices: string[];
	export let name: string;
	export let required = false;
	export let value: string | null;
</script>

<fieldset>
	<legend>{name}</legend>
	{#each choices as choice}
		<div>
			<input
				type="radio"
				bind:group={value}
				{name}
				id={name + '_' + choice}
				value={choice}
				{required}
			/>
			<label for={name + '_' + choice}>{choice}</label>
		</div>
	{/each}
</fieldset>

<style>
	input {
		height: initial;
	}

	div {
		margin-right: 1rem;
	}

	label,
	legend {
		text-transform: capitalize;
	}
</style>
