<script>
	import { page } from '$app/stores';
	let message = '';
	if ($page.error) {
		message = $page.error.message;
	}
</script>

<h1>{$page.status}</h1>
{#if $page.status === 401}
	<p>{message ? message : 'Unauthorized'}</p>
	<p>
		Please make sure you've logged into your account before accessing this page. If you still run
		into issues, please contact <a href="mailto:tech@freetailhackers.com"
			>tech@freetailhackers.com
		</a>
	</p>
{:else}
	<p>{message}</p>
{/if}
