<script lang="ts">
	import IconArrowRight from "~icons/lucide/arrow-right";

	import type { CategoryId, Dish } from "#lib/data/dishes.js";
	import { categories } from "#lib/data/dishes.js";
	import Chip from "#lib/components/ui/Chip.svelte";
	import SectionHeader from "#lib/components/ui/SectionHeader.svelte";
	import TabHeading from "#lib/components/ui/TabHeading.svelte";
	import TextButton from "#lib/components/ui/TextButton.svelte";
	import DishCard from "./DishCard.svelte";

	type Props = {
		dishes: Dish[];
		category: CategoryId;
		favoriteIds: string[];
		cartIsEmpty: boolean;
		onCategory: (id: CategoryId) => void;
		onFavorite: (id: string) => void;
		onAdd: (id: string) => void;
	};

	let {
		dishes,
		category,
		favoriteIds,
		cartIsEmpty,
		onCategory,
		onFavorite,
		onAdd,
	}: Props = $props();
</script>

<TabHeading
	eyebrow="Добрый вечер, Аня"
	title="Что сегодня"
	accent="для души?"
/>

<div class="menu__filters">
	{#each categories as item (item.id)}
		<Chip
			label={item.label}
			active={category === item.id}
			onclick={() => onCategory(item.id)}
		/>
	{/each}
</div>

<SectionHeader overline="Curated for you" title="Маленькие радости">
	<TextButton href="/order">Корзина <IconArrowRight /></TextButton>
</SectionHeader>

<div class="menu__grid">
	{#each dishes as dish (dish.id)}
		<DishCard
			{dish}
			favorite={favoriteIds.includes(dish.id)}
			onFavorite={() => onFavorite(dish.id)}
			onAdd={() => onAdd(dish.id)}
		/>
	{/each}
</div>

{#if cartIsEmpty}
	<p class="menu__quote">
		«Еда — это язык, на котором забота говорит без слов.»
	</p>
{/if}

<style>
	.menu__filters {
		display: flex;
		gap: var(--space-4);
		margin-bottom: var(--space-9);
		padding-bottom: var(--space-2);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.menu__filters::-webkit-scrollbar {
		display: none;
	}

	.menu__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		column-gap: var(--space-5);
		row-gap: var(--space-7);
	}

	.menu__quote {
		margin-top: var(--space-8);
		color: var(--content-ui);
		font-family: var(--font-display);
		font-size: var(--text-quote);
		font-style: italic;
		text-align: center;
	}
</style>
