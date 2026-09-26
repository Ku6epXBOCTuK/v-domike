<script lang="ts">
	import type { Component } from "svelte";
	import type { SvelteHTMLElements } from "svelte/elements";

	type Props = {
		variant: "home" | "courier";
		icon: Component<SvelteHTMLElements["svg"]>;
		label: string;
	};

	let { variant, icon: Icon, label }: Props = $props();
</script>

<span class="map-marker" data-variant={variant} role="img" aria-label={label}>
	<Icon />
</span>

<style>
	.map-marker {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--map-marker-size);
		height: var(--map-marker-size);
		border-radius: var(--radius-pill);
	}

	.map-marker[data-variant="home"] {
		background: var(--surface-raised);
		color: var(--content-accent);
		box-shadow: var(--shadow-pin);
	}

	.map-marker[data-variant="courier"] {
		border-radius: var(--radius-md);
		background: var(--surface-inverse);
		color: var(--content-inverse);
		box-shadow: var(--shadow-marker);
	}

	.map-marker :global(svg) {
		width: 16px;
		height: 16px;
	}
</style>
