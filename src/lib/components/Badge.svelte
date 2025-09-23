<script lang="ts">
	export let color: string = 'gray';
	export let variant: string = 'filled';
	export let title: string = '';
	export let style: string = '';
</script>

<span class="badge {variant} {color}" {title}>
	<slot />
</span>
