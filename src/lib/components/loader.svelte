<div class="loader">
	<style>
		:global(.loader-medium) {
			--loader-size: 2rem;
		}

		:global(.loader-large) {
			--loader-size: 3rem;
		}
	</style>
	<style>
		:global(.loader) {
			--loader-color: #000;
		}
	</style>

	<!-- <div class={`loader-${size} loader`}></div> -->
</div>

<style>
	.loader {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.loader::after {
		content: '';
		display: inline-block;
		width: var(--loader-size, 8rem);
		height: var(--loader-size, 8rem);
		border-radius: 50%;
		border: 0.75rem solid var(--loader-color, #f69d9d);
		border-top-color: transparent;
		animation: loader-spin 0.8s linear infinite;
	}

	@keyframes loader-spin {
		0% {
			transform: rotate(0);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
