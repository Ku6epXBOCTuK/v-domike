<script lang="ts">
	import type { Component } from "svelte";
	import type { SvelteHTMLElements } from "svelte/elements";
	import IconHeart from "~icons/lucide/heart";
	import IconHouse from "~icons/lucide/house";
	import IconNavigation from "~icons/lucide/navigation";
	import IconUserRound from "~icons/lucide/user-round";

	import type { Tab } from "#lib/state/app.svelte.js";

	import NavItem from "./NavItem.svelte";

	type Props = {
		active: Tab;
		badgeOn?: Tab | null;
		onselect: (tab: Tab) => void;
	};

	let { active, badgeOn = null, onselect }: Props = $props();

	const items: {
		id: Tab;
		label: string;
		icon: Component<SvelteHTMLElements["svg"]>;
	}[] = [
		{ id: "menu", label: "Меню", icon: IconHouse },
		{ id: "order", label: "Заказ", icon: IconNavigation },
		{ id: "favorites", label: "Любимое", icon: IconHeart },
		{ id: "profile", label: "Профиль", icon: IconUserRound },
	];
</script>

<nav class="bottom-nav">
	{#each items as item (item.id)}
		<NavItem
			label={item.label}
			icon={item.icon}
			active={active === item.id}
			badge={badgeOn === item.id}
			onselect={() => onselect(item.id)}
		/>
	{/each}
</nav>

<style>
	.bottom-nav {
		position: fixed;
		bottom: var(--space-5);
		left: 50%;
		z-index: var(--z-nav);
		display: flex;
		align-items: center;
		justify-content: space-around;
		width: calc(100% - 2 * var(--space-5));
		max-width: var(--nav-max);
		padding: var(--space-4);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--surface-base) 94%, transparent);
		box-shadow: var(--shadow-nav);
		transform: translateX(-50%);
		backdrop-filter: blur(8px);
	}

	@media (min-width: 640px) {
		.bottom-nav {
			bottom: var(--space-9);
		}
	}
</style>
