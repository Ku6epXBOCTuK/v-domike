<script lang="ts">
	import type { Component } from "svelte";
	import type { SvelteHTMLElements } from "svelte/elements";

	type Props = {
		label: string;
		icon: Component<SvelteHTMLElements["svg"]>;
		active: boolean;
		badge?: boolean;
		onselect: () => void;
	};

	let { label, icon: Icon, active, badge = false, onselect }: Props = $props();
</script>

<button
	type="button"
	class="nav-item"
	data-active={active}
	aria-current={active ? "page" : undefined}
	{onselect}
>
	<Icon />
	<span>{label}</span>
	{#if badge}<span class="nav-item__badge"></span>{/if}
</button>

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
		background: var(--content-accent);
	}
</style>
