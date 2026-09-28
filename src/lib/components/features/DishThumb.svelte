<script lang="ts">
	import { dishImage, dishSrcset, type Dish } from "#lib/data/dishes.js";

	type Props = {
		dish: Dish;
	};

	let { dish }: Props = $props();

	let missing = $state(false);
</script>

<span
	class="dish-thumb"
	data-tone={dish.tone}
	data-empty={!dish.image || missing ? "" : undefined}
>
	<img
		class="dish-thumb__photo"
		src={dishImage(missing ? "" : dish.image)}
		srcset={dishSrcset(missing ? "" : dish.image)}
		sizes="56px"
		alt=""
		width="120"
		height="120"
		loading={dish.image && !missing ? "lazy" : "eager"}
		decoding="async"
		onerror={() => (missing = true)}
	/>
</span>

<style>
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
