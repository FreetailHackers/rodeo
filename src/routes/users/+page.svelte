<script lang="ts">
	import Users from '$lib/components/users.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Master Database</h1>

<Users users={data.users} actions={['accept', 'reject', 'waitlist']} />
