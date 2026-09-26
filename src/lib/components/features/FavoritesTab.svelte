<script lang="ts">
	import IconHeart from "~icons/lucide/heart";

	import type { Dish } from "#lib/data/dishes.js";
	import EmptyState from "#lib/components/ui/EmptyState.svelte";
	import TabHeading from "#lib/components/ui/TabHeading.svelte";
	import DishCard from "./DishCard.svelte";

	type Props = {
		dishes: Dish[];
		onFavorite: (id: string) => void;
		onAdd: (id: string) => void;
	};

	let { dishes, onFavorite, onAdd }: Props = $props();
</script>

<TabHeading eyebrow="Твои сохранённые" title="Любимое" />

{#if dishes.length}
	<div class="favorites__grid">
		{#each dishes as dish (dish.id)}
			<DishCard
				{dish}
				favorite
				onFavorite={() => onFavorite(dish.id)}
				onAdd={() => onAdd(dish.id)}
			/>
		{/each}
	</div>
{:else}
	<EmptyState icon={IconHeart} title="Здесь пока тихо" />
{/if}

<style>
	.favorites__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		column-gap: var(--space-5);
		row-gap: var(--space-7);
	}
</style>
