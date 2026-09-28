<script lang="ts">
	import { dishImage, dishSrcset, type Dish } from "#lib/data/dishes.js";
	import AddDishButton from "./AddDishButton.svelte";
	import FavoriteButton from "./FavoriteButton.svelte";

	type Props = {
		dish: Dish;
		favorite: boolean;
		onFavorite: () => void;
		onAdd: () => void;
		forceLoading?: boolean;
	};

	let {
		dish,
		favorite,
		onFavorite,
		onAdd,
		forceLoading = false,
	}: Props = $props();

	let photo = $state<HTMLImageElement>();
	let photoReady = $state(false);
	let photoMissing = $state(false);

	const missing = $derived(!dish.image || photoMissing);

	const loading = $derived(
		forceLoading || (Boolean(dish.image) && !photoReady),
	);

	$effect(() => {
		if (photo?.complete && photo.naturalWidth > 0) photoReady = true;
	});
</script>

<article class="dish-card">
	<div
		class="dish-card__media"
		data-tone={dish.tone}
		data-empty={missing ? "" : undefined}
		data-loading={loading ? "" : undefined}
	>
		{#if !forceLoading}
			<img
				bind:this={photo}
				class="dish-card__photo"
				src={dishImage(missing ? "" : dish.image)}
				srcset={dishSrcset(missing ? "" : dish.image)}
				sizes="(min-width: 640px) 170px, calc(50vw - 30px)"
				alt={missing ? "" : dish.name}
				width="600"
				height="682"
				loading={missing ? "eager" : "lazy"}
				fetchpriority={missing ? "high" : "auto"}
				decoding="async"
				onload={() => (photoReady = true)}
				onerror={() => {
					photoMissing = true;
					photoReady = true;
				}}
			/>
		{/if}
		{#if dish.image || forceLoading}
			<span
				class="dish-card__loading sheen"
				data-done={loading ? undefined : ""}
				aria-hidden="true"
			></span>
		{/if}
		{#if photoMissing}
			<p class="dish-card__note">фото не загружено</p>
		{/if}
		<FavoriteButton {dish} {favorite} onToggle={onFavorite} />
		<span class="dish-card__eta">{dish.eta}</span>
	</div>

	<div class="dish-card__body">
		<div class="dish-card__row">
			<div class="dish-card__text">
				<h3 class="dish-card__name">{dish.name}</h3>
				<p class="dish-card__detail">{dish.detail}</p>
			</div>
			<AddDishButton {dish} {onAdd} />
		</div>
		<p class="dish-card__price">{dish.price} ✦</p>
	</div>
</article>

<style>
	.dish-card {
		display: flex;
		flex-direction: column;
	}

	.dish-card__media {
		position: relative;
		aspect-ratio: 0.88;
		overflow: hidden;
		border-radius: var(--radius-lg);
	}

	.dish-card__media[data-tone="warm"] {
		--tone: var(--tone-warm);
	}

	.dish-card__media[data-tone="blush"] {
		--tone: var(--tone-blush);
	}

	.dish-card__media[data-tone="cream"] {
		--tone: var(--tone-cream);
	}

	.dish-card__media[data-tone="butter"] {
		--tone: var(--tone-butter);
	}

	.dish-card__media {
		background: var(--tone);
	}

	.dish-card__media[data-empty] {
		background: color-mix(in oklab, var(--tone) 25%, var(--surface-sunken));
	}

	.dish-card__media[data-loading] {
		background: var(--surface-sunken);
	}

	.dish-card__photo {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		mix-blend-mode: multiply;
		transition: transform var(--duration-image) var(--ease-out);
	}

	.dish-card:hover .dish-card__photo {
		transform: scale(1.05);
	}

	.dish-card__loading {
		position: absolute;
		inset: 0;
		transition: opacity var(--duration-image) var(--ease-out);
		pointer-events: none;
	}

	.dish-card__loading[data-done] {
		opacity: 0;
		animation-play-state: paused;
	}

	.dish-card__eta {
		position: absolute;
		bottom: 10px;
		left: 10px;
		padding: var(--space-2) 10px;
		border-radius: var(--radius-pill);
		background: var(--surface-glass-flat);
		color: var(--content-ui);
		font-size: var(--text-badge);
		letter-spacing: var(--tracking-wide);
	}

	/* 69% — середина между подошвой купола и низом кадра в placeholder.webp:
	   подпись встаёт под рисунком и не заезжает на бейдж времени */
	.dish-card__note {
		position: absolute;
		top: 69%;
		left: 50%;
		margin: 0;
		transform: translateX(-50%);
		color: var(--content-on-sunken-muted);
		font-size: var(--text-meta);
		letter-spacing: var(--tracking-wide);
		white-space: nowrap;
		pointer-events: none;
	}

	.dish-card__body {
		padding: var(--space-5) var(--space-2) 0;
	}

	.dish-card__row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.dish-card__text {
		min-width: 0;
	}

	.dish-card__name {
		color: var(--content-primary);
		font-family: var(--font-display);
		font-size: var(--text-card);
		line-height: var(--leading-tight);
	}

	.dish-card__detail {
		margin-top: var(--space-2);
		overflow: hidden;
		color: var(--content-secondary);
		font-size: var(--text-label);
		letter-spacing: var(--tracking-wide);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dish-card__price {
		margin-top: var(--space-4);
		color: var(--content-accent-soft);
		font-size: var(--text-meta);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
	}
</style>
