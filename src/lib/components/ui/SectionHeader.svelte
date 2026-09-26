<script lang="ts">
	import type { Snippet } from "svelte";

	import Overline from "./Overline.svelte";

	type Props = {
		overline?: string;
		title: string;
		children: Snippet;
	};

	let { overline, title, children }: Props = $props();
</script>

<header class="section-header">
	<div class="section-header__text">
		{#if overline}<Overline variant="accent">{overline}</Overline>{/if}
		<h2 class="section-header__title">{title}</h2>
	</div>
	<div class="section-header__actions">{@render children()}</div>
</header>

<style>
	.section-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
		padding-bottom: var(--space-5);
		border-bottom: 1px solid var(--border-subtle);
	}

	.section-header__title {
		color: var(--content-primary);
		font-family: var(--font-display);
		font-size: var(--text-section);
		font-weight: var(--weight-regular);
		line-height: var(--leading-tight);
		letter-spacing: var(--tracking-section);
	}

	.section-header__actions {
		display: flex;
		align-items: center;
	}
</style>
