<script lang="ts">
	export let name: string;
	export let label: string;
	export let checked: boolean;
</script>

<div>
	<input type="checkbox" class="toggle" {name} bind:checked />
	<label for={name}>{label}</label>
</div>

<style>
	div {
		display: flex;
		align-items: center;
		/* margin-bottom: 1rem; */
	}

	/* Adapted from https://danklammer.com/articles/simple-css-toggle-switch */

	.toggle {
		appearance: none;
		width: 4rem;
		height: 2rem;
		display: inline-block;
		position: relative;
		border-radius: 4rem;
		overflow: hidden;
		outline: none;
		border: none;
		cursor: pointer;
		background-color: #707070;
		transition: background-color ease 0.3s;
		margin: 0;
	}

	.toggle:before {
		content: '';
		display: block;
		position: absolute;
		z-index: 2;
		width: calc(2rem - 4px);
		height: calc(2rem - 4px);
		background: #fff;
		left: 2px;
		top: 2px;
		border-radius: 50%;
		color: #fff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
		transition: left cubic-bezier(0.2, 1, 0.5, 1) 0.3s;
	}

	.toggle:checked {
		background-color: #4cd964;
	}

	.toggle:checked:before {
		left: calc(100% - 2rem + 2px);
	}

	label {
		margin: 0 0 0 0.5rem;
	}

	input {
		padding: 0;
	}
</style>
