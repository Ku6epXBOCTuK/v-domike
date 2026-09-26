<script lang="ts">
	import { profile } from "#lib/data/profile.js";
	import Avatar from "#lib/components/ui/Avatar.svelte";
</script>

<div class="identity-card">
	<Avatar initial={profile.initial} />
	<div class="identity-card__body">
		<p class="identity-card__name">{profile.name}</p>
		<p class="identity-card__since">{profile.memberSince}</p>
	</div>
</div>

<style>
	.identity-card {
		display: flex;
		align-items: center;
		gap: var(--space-6);
		margin-bottom: var(--space-7);
		padding: var(--space-7);
		border-radius: var(--radius-xl);
		background: var(--surface-inverse);
		color: var(--content-inverse);
	}

	.identity-card__body {
		min-width: 0;
	}

	.identity-card__name {
		font-family: var(--font-display);
		font-size: var(--text-emphasis);
		line-height: var(--leading-snug);
	}

	.identity-card__since {
		margin-top: var(--space-2);
		color: var(--content-inverse-muted);
		font-size: var(--text-label);
		letter-spacing: var(--tracking-wide);
	}
</style>
