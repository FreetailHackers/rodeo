<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Master Database</h1>
<ul>
	{#each data.users as user}
		<li>
			<details>
				<summary>{user.name}</summary>
				<div>
					<p>Email: {user.email}</p>
					<p>Major: {user.major}</p>
					<p>Role: {user.role}</p>
				</div>
			</details>
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		padding: 0;
	}

	li {
		border: 2px solid black;
		/* simulate border-collapse */
		margin-left: -2px;
		margin-top: -2px;
	}

	summary {
		padding: 1rem;
	}

	details > div {
		padding: 0 1rem 0 1rem;
	}
</style>
