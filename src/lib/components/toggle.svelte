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
		width: 62px;
		height: 32px;
		display: inline-block;
		position: relative;
		border-radius: 50px;
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
		width: 28px;
		height: 28px;
		background: #fff;
		left: 2px;
		top: 2px;
		border-radius: 50%;
		color: #fff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
		transition: all cubic-bezier(0.3, 1.5, 0.7, 1) 0.3s;
	}

	.toggle:checked {
		background-color: #4cd964;
	}

	.toggle:checked:before {
		left: 32px;
	}

	input {
		padding: 0;
	}
</style>
