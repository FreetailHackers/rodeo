<script>
	export const prerender = true;

	// @ts-ignore
	const release = __RELEASE__;
	// @ts-ignore
	const build = __BUILD__;
	// @ts-ignore
	const timestamp = __TIMESTAMP__;
</script>

<p>Release {release} ({build}) @ {timestamp}</p>
