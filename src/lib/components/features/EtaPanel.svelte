<script lang="ts">
	import IconClock3 from "~icons/lucide/clock-3";

	import Overline from "#lib/components/ui/Overline.svelte";
</script>

<section class="eta-panel">
	<Overline variant="panel">Примерное прибытие</Overline>
	<div class="eta-panel__row">
		<h2 class="eta-panel__value">через 3 минуты</h2>
		<IconClock3 />
	</div>
	<p class="eta-panel__note">
		Ваш заказ бережно везут.<br />
		Можно выдохнуть и никуда не спешить.
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
