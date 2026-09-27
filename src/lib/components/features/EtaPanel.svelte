<script lang="ts">
	import IconClock3 from "~icons/lucide/clock-3";

	import type { OrderPhase } from "#lib/state/app.svelte.js";
	import Overline from "#lib/components/ui/Overline.svelte";

	type Props = {
		phase: OrderPhase;
		remaining: number;
	};

	let { phase, remaining }: Props = $props();

	const overline = $derived(
		phase === "cooking"
			? "Готовят и упаковывают"
			: phase === "delivering"
				? "Примерное прибытие"
				: "Дошли",
	);

	/* Минут остаётся от 1 до 10, поэтому хватает одного правила склонения. */
	const minutes = $derived(Math.ceil(remaining / 60_000));

	const value = $derived(
		phase === "delivered"
			? "заказ у тебя"
			: minutes <= 1
				? "меньше минуты"
				: `около ${minutes} ${minutes < 5 ? "минуты" : "минут"}`,
	);
</script>

<section class="eta-panel">
	<Overline variant="panel">{overline}</Overline>
	<div class="eta-panel__row">
		<h2 class="eta-panel__value">{value}</h2>
		<IconClock3 />
	</div>
	<p class="eta-panel__note">
		{#if phase === "delivered"}
			Можно выдохнуть и никуда не спешить.
		{:else if phase === "cooking"}
			Шеф бережно собирает бокс.
		{:else}
			Ваш заказ бережно везут.<br />
			Можно выдохнуть и никуда не спешить.
		{/if}
	</p>
</section>

<style>
	.eta-panel {
		padding: var(--space-7);
		border-radius: var(--radius-lg);
		background: var(--surface-sunken);
	}

	.eta-panel__row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-4);
		margin-top: var(--space-4);
	}

	.eta-panel__value {
		color: var(--content-on-sunken);
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: var(--weight-regular);
		line-height: var(--leading-tight);
		letter-spacing: var(--tracking-section);
	}

	/* Иконка приходит из ~icons, scope-хэш ей не достаётся — размер и цвет
	   задаются через :global(svg) по родителю. */
	.eta-panel__row :global(svg) {
		width: 20px;
		height: 20px;
		margin-bottom: var(--space-2);
		color: var(--content-on-sunken-muted);
	}

	.eta-panel__note {
		margin-top: var(--space-5);
		color: var(--content-on-sunken);
		font-size: var(--text-meta);
		line-height: var(--leading-relaxed);
	}
</style>
