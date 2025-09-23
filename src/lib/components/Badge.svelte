<script lang="ts">
	export let color: string = 'gray';
	export let variant: string = 'filled';
	export let title: string = '';
	export let style: string = ''; // added style prop
</script>

<span
	class="badge {variant} {color}"
	{title}
	style={`display: inline-block; padding: 0.2em 0.7em; border-radius: 0.7em; font-size: 0.9em; font-weight: 600; margin-right: 0.5em; background: var(--badge-bg, #eee); color: var(--badge-color, #222); ${style}`}
>
	<slot />
</span>

<style>
	.badge.filled.gray {
		background: #e0e0e0;
		color: #222;
	}
	.badge.filled.dark {
		background: #444;
		color: #fff;
	}
	.badge.filled.green {
		background: #5dc65d;
		color: #fff;
	}
	.badge.filled.red {
		background: #ff4e4e;
		color: #fff;
	}
	.badge.filled.orange {
		background: orange;
		color: #fff;
	}
	.badge.filled.teal {
		background: teal;
		color: #fff;
	}
	.badge.filled.pink {
		background: #e75480;
		color: #fff;
	}
</style>
