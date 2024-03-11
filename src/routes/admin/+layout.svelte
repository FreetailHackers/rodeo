<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="main-content">
	<h1>Admin Panel</h1>

	<ul>
		<li><a href="/admin" class:active={$page.url.pathname === '/admin'}>Admissions</a></li>
		<li>
			<a href="/admin/email" class:active={$page.url.pathname === '/admin/email'}>Email</a>
		</li>
		<li>
			<a href="/admin/questions" class:active={$page.url.pathname === '/admin/questions'}
				>Registration Questions</a
			>
		</li>
		<li>
			<a href="/admin/homepage" class:active={$page.url.pathname === '/admin/homepage'}>Homepage</a>
		</li>
	</ul>

	<hr />

	<slot />
</div>

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
