<script lang="ts">
	import { page } from '$app/stores';

	let hamburgerCheckbox: HTMLInputElement;
</script>

<h1>Admin Panel</h1>

<nav>
	<input type="checkbox" id="administration" bind:this={hamburgerCheckbox} style="display: none" />
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
	</ul>
</nav>
<hr />

<slot />

<style>
	ul {
		list-style: none;
		padding: 0;
	}

	ul a {
		display: inline;
		width: initial;
		margin-top: 20px;
	}

	ul li {
		padding-top: 15px;
	}

	.active {
		font-weight: bold;
	}
</style>
