<script lang="ts">
	interface Props {
		providers: Record<string, boolean>;
	}

	let { providers }: Props = $props();
</script>

<div id="social-logins">
	<a href="/login/oauth/google" class="social" data-sveltekit-reload>
		<button>
			<img src="/auth-assets/google.svg" alt="Google Logo" />
			<span>Continue with Google</span>
		</button>
	</a>

	<a href="/login/oauth/github" class="social" data-sveltekit-reload>
		<button>
			<img src="/auth-assets/github_light.svg" alt="GitHub Logo" />
			<span>Continue with GitHub</span>
		</button>
	</a>
</div>

<style>
	.social button {
		margin-bottom: 1em;
		width: 100%;
		background-color: transparent;
		color: var(--grey);
		border: 1px solid var(--grey);
		border-radius: var(--border-radius);
		padding: 0.5em 1em;
	}

	img {
		height: 1.5em;
		vertical-align: middle;
		padding-right: 0.25rem;
	}
</style>
