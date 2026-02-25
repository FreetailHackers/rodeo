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
	.social {
		text-decoration: none;
	}

	.social button {
		margin-bottom: 1em;
		width: 100%;
		min-width: 400px;
		height: 3.5em;
		background-color: var(--white);
		color: var(--accent);
		border: 1px solid var(--accent);
		border-radius: 25px;
		padding: 0.5em 1em;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
		transition: background-color 0.2s ease;
	}

	.social:hover button {
		background-color: var(--accent);
		color: var(--accent);
	}

	img {
		height: 2em;
		width: 2em;
		object-fit: contain;
		vertical-align: middle;
	}

	.social img[alt='GitHub Logo'] {
		filter: invert(1); /* invert the color of the GitHub logo to white (1 = white, 0 = black)*/
		height: 1.75em;
		width: 1.75em;
		padding-right: 0.25rem; /*github logo is larger than google logo, so we need to pad it*/
	}
</style>
