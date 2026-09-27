<script lang="ts">
	import type { CartEntry } from "#lib/state/app.svelte.js";
	import CartStepper from "./CartStepper.svelte";
	import DishThumb from "./DishThumb.svelte";

	type Props = {
		dish: CartEntry["dish"];
		count: number;
		sum: number;
		onAdd: () => void;
		onRemove: () => void;
	};

	let { dish, count, sum, onAdd, onRemove }: Props = $props();
</script>

<li class="cart-line">
	<DishThumb {dish} />
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
