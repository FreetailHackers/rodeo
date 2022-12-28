<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<p>Your Hacker ID is {data.user.id}.</p>
