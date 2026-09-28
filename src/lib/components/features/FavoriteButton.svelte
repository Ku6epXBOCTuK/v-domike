<script lang="ts">
	import IconHeart from "~icons/lucide/heart";

	import type { Dish } from "#lib/data/dishes.js";

	type Props = {
		dish: Dish;
		favorite: boolean;
		onToggle: () => void;
	};

	let { dish, favorite, onToggle }: Props = $props();
</script>

<button
	type="button"
	class="favorite"
	aria-label={favorite
		? `Убрать ${dish.name} из любимого`
		: `Добавить ${dish.name} в любимое`}
	aria-pressed={favorite}
	onclick={onToggle}
>
	<IconHeart />
</button>

<style>
	.favorite {
		position: absolute;
		top: 10px;
		right: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-pill);
		background: var(--surface-glass-flat);
		color: var(--content-accent);
		transition:
			background-color var(--duration-fast) ease,
			color var(--duration-fast) ease;
	}

	.favorite:hover {
		color: var(--content-accent-strong);
	}

	.favorite[aria-pressed="true"] :global(svg g) {
		fill: currentColor;
	}

	.favorite :global(svg) {
		width: 14px;
		height: 14px;
	}
</style>
