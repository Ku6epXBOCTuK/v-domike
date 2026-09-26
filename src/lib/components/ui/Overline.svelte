<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		variant?: "muted" | "accent" | "panel";
		children: Snippet;
	};

	let { variant = "muted", children }: Props = $props();
</script>

<p class="overline" data-variant={variant}>{@render children()}</p>

<style>
	.overline {
		margin-bottom: var(--space-5);
		color: var(--content-secondary);
		font-size: var(--text-meta);
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
	}

	.overline[data-variant="accent"] {
		margin-bottom: var(--space-2);
		color: var(--content-accent-strong);
		font-size: var(--text-label);
		letter-spacing: var(--tracking-overline);
	}

	.overline[data-variant="panel"] {
		margin-bottom: 0;
		color: var(--content-on-sunken-muted);
		font-size: var(--text-label);
		letter-spacing: var(--tracking-overline);
	}
</style>
