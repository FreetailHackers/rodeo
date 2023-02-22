<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<p>Release {data.release} (build {data.build}) at {data.timestamp}</p>
