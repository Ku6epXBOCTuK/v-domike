<script lang="ts">
	type Props = {
		label: string;
		active: boolean;
		onclick: () => void;
	};

	let { label, active, onclick }: Props = $props();
</script>

<button
	type="button"
	class="chip"
	data-active={active}
	aria-pressed={active}
	{onclick}
>
	{label}
</button>

<style>
	.chip {
		flex: none;
		padding: 10px var(--space-6);
		border: 1px solid transparent;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--content-ui);
		font-size: var(--text-meta);
		letter-spacing: var(--tracking-wide);
		white-space: nowrap;
		transition:
			background-color var(--duration-fast) ease,
			border-color var(--duration-fast) ease,
			color var(--duration-fast) ease;
	}

	.chip[data-active="true"] {
		background: var(--surface-inverse);
		color: var(--content-inverse);
	}

	.chip[data-active="false"]:hover {
		border-color: var(--border-strong);
		color: var(--content-primary);
	}
</style>
