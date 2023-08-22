<script lang="ts">
	import { page } from '$app/stores';

	let hamburgerCheckbox: HTMLInputElement;
</script>

<h1>Admin Panel</h1>

<nav>
	<label for="administration" id="hamburger"><b>MENU</b></label>
	<input type="checkbox" id="administration" bind:this={hamburgerCheckbox} style="display: none" />
	<ul>
		<li><a href="/admin" class:active={$page.url.pathname === '/admin'}>Admin Settings</a></li>
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
		transition: all 0.5s ease-out;
		max-height: 0;
		overflow: hidden;
	}

	#administration:checked + ul {
		display: flex;
		flex-direction: column;
		max-height: 100vh;
	}

	ul a {
		display: block;
		padding: 0.7rem 0;
	}

	@media (min-width: 768px) {
		#hamburger {
			display: none;
		}

		ul {
			display: flex;
			max-height: fit-content;
		}

		ul li + li::before {
			content: '|';
			padding: 0.5rem;
		}

		ul a {
			display: inline;
			width: initial;
		}
	}

	.active {
		font-weight: bold;
	}
</style>
