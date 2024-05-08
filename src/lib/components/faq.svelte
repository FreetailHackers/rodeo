<script lang="ts">
	import type { InfoBox, AuthUser } from '@prisma/client';
	import Accordion from './accordion.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let user: AuthUser;
	export let questions: InfoBox[];
</script>

<svelte:head>
	<title>Rodeo | FAQ</title>
</svelte:head>

<div class="homepage-content">
	<h1>FAQ</h1>
	<div class="faq-questions">
		{#each questions as question}
			<div class="faq-item">
				<Accordion>
					<span slot="head">{question.title}</span>
					<div slot="details">
						<SvelteMarkdown source={question.response} />
						{#if user?.roles.includes('ADMIN')}
							<p>
								<a href={`/admin/homepage/faq/${question.id}`}>Edit</a>
							</p>
						{/if}
					</div>
				</Accordion>
			</div>
		{/each}
	</div>
</div>

<style>
	.faq-questions {
		display: grid;
	}

	.faq-item {
		width: 100%;
	}
</style>
