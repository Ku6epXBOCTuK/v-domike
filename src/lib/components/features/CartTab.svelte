<script lang="ts">
	import { goto } from "$app/navigation";
	import IconArrowRight from "~icons/lucide/arrow-right";
	import IconShoppingBasket from "~icons/lucide/shopping-basket";

	import type { CartEntry } from "#lib/state/app.svelte.js";
	import { app } from "#lib/state/app.svelte.js";
	import EmptyState from "#lib/components/ui/EmptyState.svelte";
	import PrimaryButton from "#lib/components/ui/PrimaryButton.svelte";
	import TabHeading from "#lib/components/ui/TabHeading.svelte";
	import TextButton from "#lib/components/ui/TextButton.svelte";
	import CartLine from "./CartLine.svelte";

	type Props = {
		lines: CartEntry[];
		total: number;
		onAdd: (id: string) => void;
		onRemove: (id: string) => void;
	};

	let { lines, total, onAdd, onRemove }: Props = $props();

	function checkout() {
		app.placeOrder();
		goto("/order");
	}
</script>

<TabHeading eyebrow="Собираем заказ" title="Корзина" />

{#if lines.length}
	<ul class="cart__lines">
		{#each lines as line (line.dish.id)}
			<CartLine
				dish={line.dish}
				count={line.count}
				sum={line.dish.price * line.count}
				onAdd={() => onAdd(line.dish.id)}
				onRemove={() => onRemove(line.dish.id)}
			/>
		{/each}
	</ul>

	<p class="cart__total">
		<span class="cart__total-label">Итого</span>
		<span class="cart__total-sum">{total} ✦</span>
	</p>

	<PrimaryButton onclick={checkout}>
		Оформить заказ <IconArrowRight />
	</PrimaryButton>
{:else}
	<EmptyState icon={IconShoppingBasket} title="Здесь пока тихо">
		<p>
			Корзина ещё пуста. Можно заглянуть в меню и выбрать что-нибудь тёплое.
		</p>
		<TextButton variant="outline" href="/"
			>Выбрать что-нибудь красивое <IconArrowRight /></TextButton
		>
	</EmptyState>
{/if}

<style>
	.cart__lines {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.cart__total {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-6);
		margin-top: var(--space-8);
		padding-top: var(--space-6);
		border-top: 1px solid var(--border-subtle);
	}

	.cart__total-label {
		color: var(--content-secondary);
		font-size: var(--text-meta);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}

	.cart__total-sum {
		color: var(--content-primary);
		font-family: var(--font-display);
		font-size: var(--text-section);
		line-height: var(--leading-tight);
		letter-spacing: var(--tracking-section);
	}
</style>
