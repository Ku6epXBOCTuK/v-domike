<script lang="ts">
	import { resolve } from "$app/paths";
	import type { RouteId } from "$app/types";
	import type { Component } from "svelte";
	import type { SvelteHTMLElements } from "svelte/elements";

	type Props = {
		label: string;
		icon: Component<SvelteHTMLElements["svg"]>;
		href: RouteId;
		active: boolean;
		badge?: boolean;
	};

	let { label, icon: Icon, href, active, badge = false }: Props = $props();
</script>

<a
	class="nav-item"
	data-active={active}
	aria-current={active ? "page" : undefined}
	href={resolve(href)}
>
	<Icon />
	<span>{label}</span>
	{#if badge}<span class="nav-item__badge"></span>{/if}
</a>

<style>
	.nav-item {
		position: relative;
		display: flex;
		flex: none;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-width: 62px;
		padding: 6px var(--space-4);
		border-radius: var(--radius-md);
		color: var(--content-secondary);
		font-size: var(--text-label);
		line-height: var(--leading-snug);
		text-decoration: none;
		transition:
			background-color var(--duration-fast) ease,
			color var(--duration-fast) ease;
	}

	.nav-item[data-active="true"] {
		background: var(--surface-inverse);
		color: var(--content-inverse);
	}

	.nav-item[data-active="false"]:hover {
		color: var(--content-primary);
	}

	.nav-item :global(svg) {
		width: 16px;
		height: 16px;
	}

	.nav-item__badge {
		position: absolute;
		top: var(--space-1);
		right: var(--space-4);
		width: 6px;
		height: 6px;
		border-radius: var(--radius-pill);
		background: var(--content-accent-strong);
	}

	.nav-item[data-active="true"] .nav-item__badge {
		background: var(--content-inverse);
	}
</style>
