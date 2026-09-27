<script lang="ts">
	import type { Dish } from "#lib/data/dishes.js";
	import CartStepper from "./CartStepper.svelte";

	type Props = {
		dish: Dish;
		count: number;
		sum: number;
		onAdd: () => void;
		onRemove: () => void;
	};

	let { dish, count, sum, onAdd, onRemove }: Props = $props();
</script>

<li class="cart-line">
	<span class="cart-line__thumb" data-tone={dish.tone}>
		<img
			class="cart-line__photo"
			src={dish.image}
			alt=""
			width="120"
			height="120"
			loading="lazy"
			decoding="async"
		/>
	</span>
	<div class="cart-line__body">
		<p class="cart-line__name">{dish.name}</p>
		<p class="cart-line__sum">{sum} ✦</p>
	</div>
	<CartStepper {dish} {count} {onAdd} {onRemove} />
</li>

<style>
	.cart-line {
		display: flex;
		align-items: center;
		gap: var(--space-6);
		padding: var(--space-5);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		background: var(--surface-raised);
	}

	/* Тон под фотографией — тот же приём, что в DishCard: умножение, а не
	   наложение, потому что тёмный фон гасит снимок. */
	.cart-line__thumb {
		display: block;
		flex: none;
		overflow: hidden;
		width: 56px;
		height: 56px;
		border-radius: var(--radius-sm);
	}

	.cart-line__thumb[data-tone="warm"] {
		background: var(--tone-warm);
	}

	.cart-line__thumb[data-tone="blush"] {
		background: var(--tone-blush);
	}

	.cart-line__thumb[data-tone="cream"] {
		background: var(--tone-cream);
	}

	.cart-line__thumb[data-tone="butter"] {
		background: var(--tone-butter);
	}

	.cart-line__photo {
		width: 100%;
		height: 100%;
		object-fit: cover;
		mix-blend-mode: multiply;
	}

	.cart-line__body {
		flex: 1;
		min-width: 0;
	}

	.cart-line__name {
		color: var(--content-primary);
		font-family: var(--font-display);
		font-size: var(--text-card);
		line-height: var(--leading-tight);
	}

	.cart-line__sum {
		margin-top: var(--space-2);
		color: var(--content-accent-soft);
		font-size: var(--text-meta);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
	}
</style>
