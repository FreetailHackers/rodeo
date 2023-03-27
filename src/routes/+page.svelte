<script lang="ts">
	import { enhance } from '$app/forms';
	import Announcements from '$lib/components/announcements.svelte';
	import { Role } from '@prisma/client';
	import SvelteMarkdown from 'svelte-markdown';

	export let data;

	let email: string;

	let originalText =
		'Thanks for your interest in our upcoming hackathon! **Hack The Future** will occure from' +
		' **March 3rd, Friday evening until March 4th, Saturday evening**. Check our' +
		' [website](https://freetailhackers.com/hack-the-future) and [schedule](schedule) for more details!';

	let displayText = originalText;
	let inputText = '';
	function updateText() {
		displayText = inputText;
	}
</script>

{#if data.user}
	<h1>
		Welcome to Rodeo{#if data.user.preferredName !== null && data.user.preferredName !== ''}, {data
				.user.preferredName}{/if}!
	</h1>

	<SvelteMarkdown source={displayText} />

	<h4>Start typing to see preview:</h4>
	<SvelteMarkdown source={inputText} />
	{#if data.user?.role === Role.ADMIN}
		<form>
			<textarea
				id="info"
				placeholder="Modify the current homepage text..."
				name="info"
				rows="100"
				bind:value={inputText}
			/>
			<button on:click={updateText} type="submit">Update Homepage Text</button>
		</form>
	{/if}
	<h6>
		FORMAT EXAMPLES FOR HOMEPAGE TEXT: *italics* **bold** ***bold italic*** ~~strikethrough~~
		\`inline code snippet\` [I am a link!](https://example.com) ![Image alt
		text](https://example.com/image.png) > Blockquote
	</h6>

	<p>
		Please make sure to fill out the <a href="apply">application</a> as early as possible. Admission
		will operate on a <b>first-come, first-serve basis</b>. Spots are limited.
	</p>
	<p>
		If you have any questions or concerns, please contact
		<a href="mailto:hello@freetailhackers.com">hello@freetailhackers.com</a>.
	</p>

	<!-- Admin announcements panel -->
	<h2>Announcements</h2>
	<Announcements announcements={data.announcements} admin={data.user.role === Role.ADMIN} />
	<form method="POST" action="?/logout" use:enhance>
		<button type="submit" id="logout">Logout</button>
	</form>
{:else}
	<!-- Signup page -->
	<h1>Welcome to Rodeo</h1>
	<p>
		Rodeo is Freetail Hackers' registration platform and information board for hackathon attendees.
	</p>
	{#if !data.applicationOpen}
		<p>
			<b>
				NOTE: Applications are closed. If you would like to be notified of future events, you may
				enter your email below to subscribe to our mailing list.
			</b>
		</p>
	{/if}
	<form method="POST" action="?/login" use:enhance>
		<label for="email">To get started, enter your email: </label>
		<input
			bind:value={email}
			type="email"
			name="email"
			placeholder="student@example.edu"
			required
		/>
		<button>Continue</button>
	</form>
	<p>
		For assistance with registration, contact <a href="mailto:tech@freetailhackers.com"
			>tech@freetailhackers.com</a
		>.
	</p>
	<h2>Announcements</h2>
	<Announcements announcements={data.announcements} admin={false} />
{/if}

<style>
	#logout {
		margin-top: 1rem;
	}
	h4 {
		border-top: 1px solid black;
	}
</style>
