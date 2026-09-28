<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		onclick: () => void;
		children: Snippet;
	};

	let { onclick, children }: Props = $props();
</script>

<button type="button" class="primary" {onclick}>
	{@render children()}
</button>

<style>
	.primary {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		width: 100%;
		padding: var(--space-6) var(--space-7);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse);
		color: var(--content-inverse);
		font-size: var(--text-card);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		transition: background-color var(--duration-fast) ease;
	}

	.primary :global(svg) {
		width: 16px;
		height: 16px;
	}
</style>
