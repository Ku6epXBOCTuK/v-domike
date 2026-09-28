<script lang="ts">
	import { dishes } from "#lib/data/dishes.js";
	import { pastOrders } from "#lib/data/orders.js";
	import TabHeading from "#lib/components/ui/TabHeading.svelte";
	import DishThumb from "./DishThumb.svelte";

	const catalog = new Map(dishes.map((dish) => [dish.id, dish]));

	const rows = pastOrders.flatMap((order) => {
		const dish = catalog.get(order.dishId);
		return dish ? [{ ...order, dish }] : [];
	});
</script>

<TabHeading eyebrow="Было за вечера" title="История" accent="заказов" />

<ul class="history">
	{#each rows as row (row.id)}
		<li class="history__row">
			<DishThumb dish={row.dish} />
			<div class="history__body">
				<p class="history__name">{row.dish.name}</p>
				<p class="history__when">{row.when}</p>
				<p class="history__note">{row.note}</p>
			</div>
		</li>
	{/each}
</ul>

<style>
	.history {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.history__row {
		display: flex;
		align-items: center;
		gap: var(--space-6);
		padding: var(--space-5);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		background: var(--surface-raised);
	}

	.history__body {
		min-width: 0;
	}

	.history__name {
		color: var(--content-primary);
		font-family: var(--font-display);
		font-size: var(--text-card);
		line-height: var(--leading-tight);
	}

	.history__when {
		margin-top: var(--space-2);
		color: var(--content-secondary);
		font-size: var(--text-label);
		letter-spacing: var(--tracking-wide);
	}

	.history__note {
		margin-top: var(--space-3);
		color: var(--content-ui);
		font-size: var(--text-meta);
		line-height: var(--leading-relaxed);
	}
</style>
