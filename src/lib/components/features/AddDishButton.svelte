<script lang="ts">
	import IconPlus from "~icons/lucide/plus";

	import type { Dish } from "#lib/data/dishes.js";

	type Props = {
		dish: Dish;
		onAdd: () => void;
	};

	let { dish, onAdd }: Props = $props();
</script>

<button
	type="button"
	class="add-dish"
	aria-label={`Добавить ${dish.name}`}
	onclick={onAdd}
>
	<IconPlus />
</button>

<style>
	.add-dish {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		margin-top: var(--space-1);
		border-radius: var(--radius-pill);
		background: var(--surface-sunken);
		color: var(--content-accent-soft);
		transition:
			background-color var(--duration-fast) ease,
			color var(--duration-fast) ease;
	}

	.add-dish:hover {
		color: var(--content-accent-strong);
	}

	.add-dish :global(svg) {
		width: 14px;
		height: 14px;
	}
</style>
