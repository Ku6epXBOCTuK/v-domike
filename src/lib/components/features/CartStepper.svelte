<script lang="ts">
	import IconMinus from "~icons/lucide/minus";
	import IconPlus from "~icons/lucide/plus";

	import type { Dish } from "#lib/data/dishes.js";

	type Props = {
		dish: Dish;
		count: number;
		onAdd: () => void;
		onRemove: () => void;
	};

	let { dish, count, onAdd, onRemove }: Props = $props();
</script>

<div class="stepper">
	<button
		type="button"
		class="stepper__button"
		aria-label={`Убрать одну порцию: ${dish.name}`}
		onclick={onRemove}
	>
		<IconMinus />
	</button>
	<span class="stepper__count">{count}</span>
	<button
		type="button"
		class="stepper__button"
		aria-label={`Добавить ещё: ${dish.name}`}
		onclick={onAdd}
	>
		<IconPlus />
	</button>
</div>

<style>
	.stepper {
		display: flex;
		flex: none;
		align-items: center;
		gap: var(--space-4);
	}

	.stepper__button {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-pill);
		background: var(--surface-sunken);
		color: var(--content-accent-soft);
		transition:
			background-color var(--duration-fast) ease,
			color var(--duration-fast) ease;
	}

	.stepper__button:hover {
		color: var(--content-accent-strong);
	}

	.stepper__button :global(svg) {
		width: 14px;
		height: 14px;
	}

	.stepper__count {
		min-width: 14px;
		color: var(--content-primary);
		font-family: var(--font-display);
		font-size: var(--text-card);
		line-height: var(--leading-tight);
		text-align: center;
	}
</style>
