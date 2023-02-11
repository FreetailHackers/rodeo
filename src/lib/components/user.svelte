<script lang="ts">
	import type { Prisma } from '@prisma/client';

	export let user: Prisma.UserGetPayload<{ include: { decision: true } }>;
</script>

<p><b>EMAIL</b> {user.email}</p>
<p><b>ROLE</b> {user.role}</p>
<p>
	<b>STATUS</b>
	{user.status}
	{#if user.decision}(Pending {user.decision.status}){/if}
</p>
<p><b>PREFERRED NAME</b> {user.preferredName}</p>
<p><b>GENDER</b> {user.gender}</p>
<p><b>PHOTO RELEASE AGREED</b> {user.photoReleaseAgreed}</p>
<p><b>LIABILITY WAIVER AGREED</b> {user.liabilityWaiverAgreed}</p>
<p><b>CODE OF CONDUCT AGREED</b> {user.codeOfConductAgreed}</p>
<p><b>MAJOR</b> {user.major}</p>
<p><b>CLASSIFICATION</b> {user.classification}</p>
<p><b>GRADUATION</b> {user.graduation}</p>
<p><b>HACKATHONS ATTENDED</b> {user.hackathonsAttended}</p>
<p><b>WORKSHOPS</b> {user.workshops}</p>
<p><b>REFERRER</b> {user.referrer}</p>
<p><b>EXCITED ABOUT</b> {user.excitedAbout}</p>
<p><b>RESUME</b> {user.resume}</p>
<p><b>GITHUB</b> {user.github}</p>
<p><b>LINKEDIN</b> {user.linkedin}</p>
<p><b>WEBSITE</b> {user.website}</p>
<p><b>LUNCH</b> {user.lunch}</p>
<p><b>DIETARY RESTRICTIONS</b> {user.dietaryRestrictions}</p>
<p><b>ALLERGIES</b> {user.allergies}</p>
<p><b>ACCOMODATIONS</b> {user.accommodations}</p>
<p><b>OTHER</b> {user.other}</p>
