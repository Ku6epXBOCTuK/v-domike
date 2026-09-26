<script lang="ts">
	import { profileLinks } from "#lib/data/profile.js";
	import TabHeading from "#lib/components/ui/TabHeading.svelte";
	import IdentityCard from "./IdentityCard.svelte";
	import ProfileRow from "./ProfileRow.svelte";
</script>

<TabHeading eyebrow="Твоё пространство" title="Профиль" />

<IdentityCard />

<ul class="profile__rows">
	{#each profileLinks as link (link.id)}
		<li>
			<ProfileRow label={link.label} icon={link.icon} href={link.href} />
		</li>
	{/each}
</ul>

<style>
	.profile__rows {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
</style>
