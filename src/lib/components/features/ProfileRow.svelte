<script lang="ts">
	import { resolve } from "$app/paths";
	import type { RouteId } from "$app/types";
	import type { Component } from "svelte";
	import type { SvelteHTMLElements } from "svelte/elements";
	import IconArrowRight from "~icons/lucide/arrow-right";
	import IconBell from "~icons/lucide/bell";
	import IconClock3 from "~icons/lucide/clock-3";

	import type { ProfileLinkIcon } from "#lib/data/profile.js";

	type Props = {
		label: string;
		icon: ProfileLinkIcon;
		href: RouteId;
	};

	let { label, icon, href }: Props = $props();

	const icons: Record<ProfileLinkIcon, Component<SvelteHTMLElements["svg"]>> = {
		clock: IconClock3,
		bell: IconBell,
	};

	const Icon = $derived(icons[icon]);
</script>

<a class="profile-row" href={resolve(href)}>
	<span class="profile-row__lead">
		<span class="profile-row__chip">
			<Icon />
		</span>
		{label}
	</span>
	<IconArrowRight />
</a>

<style>
	.profile-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		width: 100%;
		padding: var(--space-6);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		background: var(--surface-raised);
		color: var(--content-primary);
		font-size: var(--text-row);
		text-align: left;
		text-decoration: none;
		transition:
			background-color var(--duration-fast) ease,
			border-color var(--duration-fast) ease;
	}

	.profile-row:hover {
		border-color: var(--border-strong);
		background: var(--surface-sunken);
	}

	.profile-row__lead {
		display: flex;
		align-items: center;
		gap: var(--space-5);
		min-width: 0;
	}

	.profile-row__chip {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-sm);
		background: var(--surface-sunken);
		color: var(--content-accent-soft);
	}

	.profile-row :global(svg) {
		width: 16px;
		height: 16px;
	}

	.profile-row > :global(svg) {
		color: var(--content-ui);
	}
</style>
