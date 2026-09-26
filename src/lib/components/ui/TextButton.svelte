<script lang="ts">
	import { resolve } from "$app/paths";
	import type { RouteId } from "$app/types";
	import type { Snippet } from "svelte";

	type Props = {
		href: RouteId;
		variant?: "inline" | "outline";
		children: Snippet;
	};

	let { href, variant = "inline", children }: Props = $props();
</script>

<a class="text-button" data-variant={variant} href={resolve(href)}
	>{@render children()}</a
>

<style>
	.text-button {
		display: flex;
		align-items: center;
		color: var(--content-accent-soft);
		font-size: var(--text-meta);
		letter-spacing: var(--tracking-wide);
		text-decoration: none;
		transition:
			background-color var(--duration-fast) ease,
			color var(--duration-fast) ease;
	}

	.text-button[data-variant="inline"] {
		gap: var(--space-2);
	}

	.text-button[data-variant="inline"]:hover {
		color: var(--content-accent-strong);
	}

	.text-button[data-variant="outline"] {
		width: 100%;
		justify-content: center;
		gap: var(--space-4);
		margin-top: var(--space-7);
		padding: 12px var(--space-6);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-pill);
		color: var(--content-ui);
		font-size: var(--text-row);
	}

	.text-button[data-variant="outline"]:hover {
		background: var(--surface-sunken);
		color: var(--content-primary);
	}

	.text-button :global(svg) {
		width: 14px;
		height: 14px;
	}
</style>
