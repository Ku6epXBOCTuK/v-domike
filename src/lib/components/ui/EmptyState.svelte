<script lang="ts">
	import type { Component, Snippet } from "svelte";
	import type { SvelteHTMLElements } from "svelte/elements";

	type Props = {
		icon: Component<SvelteHTMLElements["svg"]>;
		title: string;
		children?: Snippet;
	};

	let { icon: Icon, title, children }: Props = $props();
</script>

<div class="empty-state">
	<Icon />
	<p class="empty-state__title">{title}</p>
	{#if children}
		<div class="empty-state__body">{@render children()}</div>
	{/if}
</div>

<style>
	.empty-state {
		padding: var(--space-8);
		border-radius: var(--radius-xl);
		background: var(--surface-sunken);
		text-align: center;
	}

	.empty-state :global(svg) {
		width: 24px;
		height: 24px;
		margin: 0 auto var(--space-5);
		color: var(--content-accent);
	}

	.empty-state__title {
		color: var(--content-primary);
		font-family: var(--font-display);
		font-size: var(--text-emphasis);
		line-height: var(--leading-snug);
	}

	.empty-state__body {
		margin-top: var(--space-5);
		color: var(--content-on-sunken-muted);
		font-size: var(--text-meta);
		line-height: var(--leading-relaxed);
	}
</style>
