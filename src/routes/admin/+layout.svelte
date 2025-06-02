<script lang="ts">
	import { page } from '$app/state';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="main-content">
	<h1>Admin Panel</h1>

	<ul>
		<li><a href="/admin" class:active={page.url.pathname === '/admin'}>Admissions</a></li>
		<li>
			<a href="/admin/email" class:active={page.url.pathname === '/admin/email'}>Email Templates</a>
		</li>
		<li>
			<a href="/admin/questions" class:active={page.url.pathname === '/admin/questions'}
				>Registration Questions</a
			>
		</li>
		<li>
			<a href="/admin/homepage" class:active={page.url.pathname === '/admin/homepage'}>Homepage</a>
		</li>
	</ul>

	{@render children?.()}
</div>

<style>
	h1 {
		margin-bottom: 0;
	}

	ul {
		list-style: none;
		margin: 0.5em 0;
		padding: 0;

		display: flex;
		flex-direction: row;
		gap: 1em;
	}

	a {
		text-decoration: none;
		color: var(--black);
	}

	.active {
		font-weight: bold;
		text-decoration: underline;
	}
</style>
