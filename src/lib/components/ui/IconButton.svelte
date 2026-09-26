<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		label: string;
		tone?: "warm" | "plain" | "glass" | "sunken";
		size?: "xs" | "sm" | "md";
		pressed?: boolean;
		dot?: boolean;
		onclick: () => void;
		children: Snippet;
	};

	let {
		label,
		tone = "plain",
		size = "md",
		pressed = undefined,
		dot = false,
		onclick,
		children,
	}: Props = $props();
</script>

<button
	type="button"
	class="icon-button"
	data-tone={tone}
	data-size={size}
	aria-label={label}
	aria-pressed={pressed}
	{onclick}
>
	{@render children()}
	{#if dot}<span class="icon-button__dot"></span>{/if}
</button>

<style>
	.icon-button {
		position: relative;
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		border: 1px solid transparent;
		border-radius: var(--radius-pill);
		transition:
			background-color var(--duration-fast) ease,
			color var(--duration-fast) ease,
			transform var(--duration-fast) var(--ease-out);
	}

	.icon-button[data-size="md"] {
		width: 40px;
		height: 40px;
	}

	.icon-button[data-size="sm"] {
		width: 32px;
		height: 32px;
	}

	.icon-button[data-size="xs"] {
		width: 28px;
		height: 28px;
	}

	/* unplugin-icons не отдаёт scope-хэш своему корню, поэтому размер иконки
	   задаётся селектором по :global(svg) — см. docs/port-plan.md, Этап 3. */
	.icon-button :global(svg) {
		width: 16px;
		height: 16px;
	}

	.icon-button[data-size="xs"] :global(svg),
	.icon-button[data-size="sm"] :global(svg) {
		width: 14px;
		height: 14px;
	}

	.icon-button[data-tone="warm"] {
		border-color: var(--border-strong);
		background: var(--surface-warm);
		color: var(--content-accent-soft);
	}

	.icon-button[data-tone="warm"]:hover {
		transform: rotate(-10deg) scale(1.04);
	}

	.icon-button[data-tone="plain"] {
		border-color: var(--border-subtle);
		color: var(--content-ui);
	}

	.icon-button[data-tone="plain"]:hover {
		background: var(--surface-sunken);
	}

	.icon-button[data-tone="glass"] {
		background: var(--surface-glass);
		color: var(--content-accent);
		backdrop-filter: blur(8px);
	}

	.icon-button[data-tone="glass"]:hover {
		color: var(--content-accent-strong);
	}

	.icon-button[data-tone="sunken"] {
		background: var(--surface-sunken);
		color: var(--content-accent-soft);
	}

	.icon-button[data-tone="sunken"]:hover {
		background: var(--surface-sunken);
		color: var(--content-accent-strong);
	}

	/* Заливка «включённого» сердца. Селектор по :global(svg g), потому что
	   unplugin-icons кладёт fill="none" именно на обёртку <g>. Ключ — по
	   aria-pressed, а не по data-pressed: тот атрибут есть в разметке,
	   поэтому svelte-check не считает селектор неиспользуемым. */
	.icon-button[aria-pressed="true"] :global(svg g) {
		fill: currentColor;
	}

	.icon-button__dot {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 6px;
		height: 6px;
		border-radius: var(--radius-pill);
		background: var(--content-accent);
	}
</style>
