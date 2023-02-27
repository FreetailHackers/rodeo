<script>
	import { page } from '$app/stores';
</script>

<h1>{$page.status} {$page.error?.message}</h1>
{#if $page.status === 401}
	<p>
		Please make sure you've logged into your account before accessing this page. If you've misplaced
		your magic link, you may request a new one by entering your email on the <a href="/">homepage</a
		> again.
	</p>
{/if}
