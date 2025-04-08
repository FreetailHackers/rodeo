<script lang="ts">
	export let name: string;
	export let label: string;
	export let checked: boolean;
	export let isLeft: boolean = false;
</script>

<div>
	<div class="button-box" class:left={isLeft}>
		<input type="checkbox" class="toggle" {name} bind:checked />
		<label for={name}>{label}</label>
	</div>
</div>

<style>
	div {
		display: flex;
		align-items: center;
	}

	.button-box {
		gap: 0.5rem;
		display: flex;
		align-items: center;
		flex-direction: row;
	}

	.button-box.left {
		flex-direction: row-reverse;
	}

	/* Adapted from https://danklammer.com/articles/simple-css-toggle-switch */

	.toggle {
		appearance: none;
		width: 2.5rem;
		height: 1rem;
		display: inline-block;
		position: relative;
		border-radius: 4rem;
		outline: none;
		border: none;
		cursor: pointer;
		background-color: #888;
		transition: background-color ease 0.3s;
		margin: 0;
	}

	.toggle:before {
		content: '';
		display: block;
		position: absolute;
		z-index: 2;
		width: 1.25rem;
		height: 1.25rem;
		background: #eee;
		left: -0.125rem;
		top: -0.125rem;
		border-radius: 50%;
		box-shadow: 0 0 0.2rem rgba(0, 0, 0, 0.4);
		transition: left cubic-bezier(0.2, 1, 0.5, 1) 0.3s;
	}

	.toggle:checked {
		background-color: #4cd964;
	}

	.toggle:checked:before {
		left: calc(100% - 1.125rem);
	}

	input {
		padding: 0;
	}
</style>
