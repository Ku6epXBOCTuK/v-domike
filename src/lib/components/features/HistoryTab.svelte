<script lang="ts">
	import { dishes } from "#lib/data/dishes.js";
	import { pastOrders } from "#lib/data/orders.js";
	import TabHeading from "#lib/components/ui/TabHeading.svelte";

	const catalog = new Map(dishes.map((dish) => [dish.id, dish]));

	/* Заказ без блюда в каталоге пропускается: падать из-за данных нельзя. */
	const rows = pastOrders.flatMap((order) => {
		const dish = catalog.get(order.dishId);
		return dish ? [{ ...order, dish }] : [];
	});
</script>

<TabHeading eyebrow="Было за вечера" title="История" accent="заказов" />

<ul class="history">
	{#each rows as row (row.id)}
		<li class="history__row">
			<span class="history__thumb" data-tone={row.dish.tone}>
				<img
					class="history__photo"
					src={row.dish.image}
					alt={row.dish.name}
					width="120"
					height="120"
					loading="lazy"
					decoding="async"
				/>
			</span>
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

	/* Тон под фотографией — тот же приём, что в DishCard: умножение, а не
	   наложение, потому что тёмный фон гасит снимок. */
	.history__thumb {
		display: block;
		flex: none;
		overflow: hidden;
		width: 56px;
		height: 56px;
		border-radius: var(--radius-sm);
	}

	.history__thumb[data-tone="warm"] {
		background: var(--tone-warm);
	}

	.history__thumb[data-tone="blush"] {
		background: var(--tone-blush);
	}

	.history__thumb[data-tone="cream"] {
		background: var(--tone-cream);
	}

	.history__thumb[data-tone="butter"] {
		background: var(--tone-butter);
	}

	.history__photo {
		width: 100%;
		height: 100%;
		object-fit: cover;
		mix-blend-mode: multiply;
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
