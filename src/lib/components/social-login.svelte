<script lang="ts">
	export let providers: Record<string, boolean>;
</script>

<div id="social-logins">
	{#if providers.google}
		<a href="/login/oauth?provider=google" class="social">
			<button>
				<img src="/auth-assets/google.svg" alt="Google Logo" />
				<span>Continue with Google</span>
			</button>
		</a>
	{/if}
	{#if providers.github}
		<a href="/login/oauth?provider=github" class="social">
			<button>
				<img src="/auth-assets/github.svg" alt="GitHub Logo" />
				<span>Continue with GitHub</span>
			</button>
		</a>
	{/if}
</div>

<style>
	.social button {
		margin-bottom: 1em;
		width: 100%;
		background-color: transparent;
		color: grey;
		border: 1px solid grey;
		border-radius: 15px;
		padding: 0.5em 1em;
	}

	img {
		height: 100%;
		vertical-align: middle;
		padding-right: 0.25rem;
	}
</style>
