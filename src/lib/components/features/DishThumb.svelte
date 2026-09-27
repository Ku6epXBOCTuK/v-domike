<script lang="ts">
	import { dishImage, type Dish } from "#lib/data/dishes.js";

	type Props = {
		dish: Dish;
	};

	let { dish }: Props = $props();
</script>

<span
	class="dish-thumb"
	data-tone={dish.tone}
	data-empty={dish.image ? undefined : ""}
>
	<img
		class="dish-thumb__photo"
		src={dishImage(dish.image)}
		alt=""
		width="120"
		height="120"
		loading="lazy"
		decoding="async"
	/>
</span>

<style>
	/* Тон под фотографией — обязателен: снимок умножается на подложку, и без неё
	   в тёмной теме фото гаснет вместе с фоном. */
	.dish-thumb {
		display: block;
		flex: none;
		overflow: hidden;
		width: 56px;
		height: 56px;
		border-radius: var(--radius-sm);
	}

	.dish-thumb[data-tone="warm"] {
		--tone: var(--tone-warm);
	}

	.dish-thumb[data-tone="blush"] {
		--tone: var(--tone-blush);
	}

	.dish-thumb[data-tone="cream"] {
		--tone: var(--tone-cream);
	}

	.dish-thumb[data-tone="butter"] {
		--tone: var(--tone-butter);
	}

	.dish-thumb {
		background: var(--tone);
	}

	/* Как в DishCard: плейсхолдер берёт темноту экрана, фото — светлый тон. */
	.dish-thumb[data-empty] {
		background: color-mix(in oklab, var(--tone) 25%, var(--surface-sunken));
	}

	.dish-thumb__photo {
		width: 100%;
		height: 100%;
		object-fit: cover;
		mix-blend-mode: multiply;
	}
</style>
