<script lang="ts">
	import { enhance } from '$app/forms';
	import Announcements from '$lib/components/announcements.svelte';
	import { Role } from '@prisma/client';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let email: string;
</script>

{#if data.user}
	<h1>
		Welcome to Rodeo{#if data.user.preferredName !== null && data.user.preferredName !== ''}, {data
				.user.preferredName}{/if}!
	</h1>
	<p>
		Thanks for your interest in our upcoming hackathon! <b>Hack The Future</b> will occur from
		<b>March 3rd, Friday evening until March 4th, Saturday evening</b>. Check our
		<a href="https://freetailhackers.com/hack-the-future">website</a>
		and <a href="schedule">schedule</a> for more details!
	</p>
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
	{#if form}
		<p>{form}</p>
		<p>
			For help, contact <a href="mailto:tech@freetailhackers.com">tech@freetailhackers.com</a>.
		</p>
	{/if}
	<h2>Announcements</h2>
	<Announcements announcements={data.announcements} admin={false} />
{/if}

<style>
	#logout {
		margin-top: 1rem;
	}
</style>
