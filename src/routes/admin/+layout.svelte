<script lang="ts">
	import { page } from '$app/stores';
</script>

<h1>Admin Panel</h1>

<ul>
	<li><a href="/admin" class:active={$page.url.pathname === '/admin'}>Admissions</a></li>
	<li>
		<a href="/admin/templates" class:active={$page.url.pathname === '/admin/templates'}
			>Email Templates</a
		>
	</li>
	<li>
		<a href="/admin/questions" class:active={$page.url.pathname === '/admin/questions'}
			>Registration Questions</a
		>
	</li>
	<li>
		<a href="/admin/statistics" class:active={$page.url.pathname === '/admin/statistics'}
			>User Statistics</a
		>
	</li>
</ul>
<hr />

<slot />

<style>
	h1 {
		margin-bottom: 0;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	ul li {
		padding-top: 15px;
	}

	hr {
		margin: 1rem 0;
	}

	.active {
		font-weight: bold;
	}
</style>
