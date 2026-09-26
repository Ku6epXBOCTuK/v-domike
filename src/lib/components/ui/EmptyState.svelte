<script lang="ts">
	import type { Component } from "svelte";
	import type { SvelteHTMLElements } from "svelte/elements";

	type Props = {
		icon: Component<SvelteHTMLElements["svg"]>;
		title: string;
	};

	let { icon: Icon, title }: Props = $props();
</script>

<div class="empty-state">
	<Icon />
	<p class="empty-state__title">{title}</p>
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
</style>
