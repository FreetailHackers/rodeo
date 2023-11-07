<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Select from 'svelte-select';
	import fuzzysort from 'fuzzysort';

	export let name: string; // Name for the input
	export let id = name; // ID for the input
	export let items: string[]; // Items to display in the dropdown
	export let custom = false; // Whether to allow custom values
	export let multiple = false; // Whether to allow multiple values
	export let value: string; // Value of the dropdown
	export let json = false; // Whether to parse the value as JSON (mainly useful for GET forms)

	let filterText: string;

	const dispatch = createEventDispatcher();
</script>

<Select
	{id}
	{name}
	class={$$props.class}
	itemFilter={(label, filterText) =>
		filterText === '' || fuzzysort.go(filterText, [label]).length > 0}
	items={custom && filterText ? [...new Set([...items, filterText])] : items}
	bind:filterText
	on:input={(event) => {
		// Manually update search variable because binding it to justValue along with
		// defining an expression for value causes an infinite loop for some reason 😭😭😭
		if (!event.detail) {
			value = '';
		} else if (multiple) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore: Svelte doesn't support TypeScript in HTML template expressions 😭
			value = event.detail.map((item) => item.value);
		} else {
			value = event.detail.value;
		}
		if (json) {
			value = JSON.stringify(value);
		}
		dispatch('input', event);
	}}
	value={(() => {
		if (!json) {
			return value;
		}
		// Ugly but this is the easiest way I found to populate the dropdown that works when
		// you refresh the page
		try {
			return JSON.parse(value);
		} catch (e) {
			return '';
		}
	})()}
	{multiple}
	closeListOnChange={!multiple}
	containerStyles="border: 2px solid gray; border-radius: 0; margin-top: 0px; min-height: 2.5rem; min-width: 60%"
	inputStyles="margin: 0; height: initial"
>
	<!-- Horrible hack to make svelte-select submit just the values without the container object -->
	<div slot="input-hidden" let:value>
		<input
			type="hidden"
			{name}
			value={(() => {
				if (multiple) {
					return Array.isArray(value) ? JSON.stringify(value.map((item) => item.value)) : '';
				}
				return value ? JSON.stringify(value.value) : '';
			})()}
		/>
	</div>
	<div slot="item" let:item>
		{items.includes(item.label) ? '' : 'Other: '}
		{item.label}
	</div>
</Select>
