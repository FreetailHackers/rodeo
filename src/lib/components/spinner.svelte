<script lang="ts">
	export let size = 24;
</script>

<svg width={size} height={size} viewBox="0 0 24 24" class="spinner">
	<circle class="path" cx="12" cy="12" r="10" fill="none" stroke-width="4" />
</svg>

<style>
	.spinner {
		animation: rotate 1s linear infinite;
	}

	.path {
		stroke: #ffffff;
		stroke-linecap: round;
		stroke-dasharray: 80;
		stroke-dashoffset: 60;
	}

	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}
</style>
