<script lang="ts">
	import { page } from "$app/state";
	import type { Component } from "svelte";
	import type { SvelteHTMLElements } from "svelte/elements";
	import IconHeart from "~icons/lucide/heart";
	import IconHouse from "~icons/lucide/house";
	import IconNavigation from "~icons/lucide/navigation";
	import IconUserRound from "~icons/lucide/user-round";

	import { TABS } from "#lib/state/app.svelte.js";

	import NavItem from "./NavItem.svelte";

	type Props = {
		badgeOn?: string | null;
	};

	let { badgeOn = null }: Props = $props();

	const icons: Record<string, Component<SvelteHTMLElements["svg"]>> = {
		menu: IconHouse,
		order: IconNavigation,
		favorites: IconHeart,
		profile: IconUserRound,
	};

	const current = $derived(page.url.pathname);

	function isActive(path: string) {
		return current === path || current.startsWith(`${path}/`);
	}
</script>

<nav class="bottom-nav">
	{#each TABS as tab (tab.id)}
		<NavItem
			label={tab.label}
			icon={icons[tab.id]}
			href={tab.path}
			active={isActive(tab.path)}
			badge={badgeOn === tab.id}
		/>
	{/each}
</nav>

<style>
	.bottom-nav {
		position: fixed;

		inset-inline: max(var(--space-5), var(--safe-left))
			max(var(--space-5), var(--safe-right));
		bottom: calc(var(--safe-bottom) + var(--space-5));
		z-index: var(--z-nav);
		display: flex;
		align-items: center;
		justify-content: space-around;
		max-width: var(--nav-max);
		min-height: var(--nav-height);
		margin-inline: auto;
		padding: var(--space-4);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--surface-base) 94%, transparent);
		box-shadow: var(--shadow-nav);
		backdrop-filter: blur(8px);
	}

	@media (min-width: 640px) {
		.bottom-nav {
			bottom: calc(var(--safe-bottom) + var(--space-9));
		}
	}
</style>
