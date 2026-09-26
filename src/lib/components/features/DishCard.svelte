<script lang="ts">
	import IconHeart from "~icons/lucide/heart";
	import IconPlus from "~icons/lucide/plus";

	import type { Dish } from "#lib/data/dishes.js";
	import IconButton from "#lib/components/ui/IconButton.svelte";

	type Props = {
		dish: Dish;
		favorite: boolean;
		onFavorite: () => void;
		onAdd: () => void;
	};

	let { dish, favorite, onFavorite, onAdd }: Props = $props();
</script>

<article class="dish-card">
	<div class="dish-card__media" data-tone={dish.tone}>
		<img
			class="dish-card__photo"
			src={dish.image}
			alt={dish.name}
			width="600"
			height="682"
			loading="lazy"
			decoding="async"
		/>
		<div class="dish-card__heart">
			<IconButton
				tone="glass"
				size="sm"
				pressed={favorite}
				label={favorite
					? `Убрать ${dish.name} из любимого`
					: `Добавить ${dish.name} в любимое`}
				onclick={onFavorite}
			>
				<IconHeart />
			</IconButton>
		</div>
		<span class="dish-card__eta">{dish.eta}</span>
	</div>

	<div class="dish-card__body">
		<div class="dish-card__row">
			<div class="dish-card__text">
				<h3 class="dish-card__name">{dish.name}</h3>
				<p class="dish-card__detail">{dish.detail}</p>
			</div>
			<div class="dish-card__add">
				<IconButton
					tone="sunken"
					size="xs"
					label={`Добавить ${dish.name}`}
					onclick={onAdd}
				>
					<IconPlus />
				</IconButton>
			</div>
		</div>
		<p class="dish-card__price">{dish.price} coins</p>
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
		background: var(--tone-warm);
	}

	.dish-card__media[data-tone="blush"] {
		background: var(--tone-blush);
	}

	.dish-card__media[data-tone="cream"] {
		background: var(--tone-cream);
	}

	.dish-card__media[data-tone="butter"] {
		background: var(--tone-butter);
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

	.dish-card__heart {
		position: absolute;
		top: 10px;
		right: 10px;
	}

	.dish-card__eta {
		position: absolute;
		bottom: 10px;
		left: 10px;
		padding: var(--space-2) 10px;
		border-radius: var(--radius-pill);
		background: var(--surface-glass);
		backdrop-filter: blur(8px);
		color: var(--content-ui);
		font-size: var(--text-badge);
		letter-spacing: var(--tracking-wide);
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

	.dish-card__add {
		margin-top: var(--space-1);
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
