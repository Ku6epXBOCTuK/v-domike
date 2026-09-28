<script lang="ts">
	import type { Dish } from "#lib/data/dishes.js";
	import { dishes } from "#lib/data/dishes.js";
	import DishCard from "#lib/components/features/DishCard.svelte";
	import SkeletonCard from "#lib/components/features/SkeletonCard.svelte";
	import TabHeading from "#lib/components/ui/TabHeading.svelte";

	const pick = (id: string) => {
		const dish = dishes.find((item) => item.id === id);
		if (!dish) throw new Error(`в меню нет блюда ${id}`);
		return dish as Dish;
	};

	const tones: { tone: string; dish: Dish }[] = [
		{ tone: "warm", dish: pick("borsh") },
		{ tone: "blush", dish: pick("kholodnik") },
		{ tone: "cream", dish: pick("krem-sup-iz-shpinata") },
		{ tone: "butter", dish: pick("bulon-s-vermishel") },
	];

	const load = pick("borsh");
	const empty = pick("solyanka");
</script>

<TabHeading eyebrow="Служебная" title="Скелетоны" />

<p class="skeletons__lead">
	Слепок настоящих компонентов, а не макет: те же карточки, что едут в меню.
	Тему переключает кнопка в шапке.
</p>

<section class="skeletons__section">
	<h2 class="skeletons__title">
		Грузится / приехал — парами, по одной на подложку
	</h2>
	<div class="skeletons__grid">
		{#each tones as { tone, dish } (tone)}
			<DishCard
				{dish}
				forceLoading
				favorite={false}
				onFavorite={() => {}}
				onAdd={() => {}}
			/>
			<DishCard
				{dish}
				favorite={false}
				onFavorite={() => {}}
				onAdd={() => {}}
			/>
		{/each}
	</div>
	<p class="skeletons__note">
		Слева скелетон, справа тот же блюд с фотографией. Смотреть надо именно так:
		в меню пустая карточка всегда стоит рядом с полной, и именно на этом
		соседстве решается, читается ли скелетон как «ещё грузится».
	</p>
</section>

<section class="skeletons__section">
	<h2 class="skeletons__title">Три состояния одного блюда</h2>
	<div class="skeletons__grid skeletons__grid--trio">
		<DishCard
			dish={load}
			forceLoading
			favorite={false}
			onFavorite={() => {}}
			onAdd={() => {}}
		/>
		<DishCard
			dish={load}
			favorite={false}
			onFavorite={() => {}}
			onAdd={() => {}}
		/>
		<DishCard
			dish={empty}
			favorite={false}
			onFavorite={() => {}}
			onAdd={() => {}}
		/>
	</div>
	<p class="skeletons__note">
		Слева грузится, по центру снимок приехал, справа снимка нет и вместо него
		купол. Борщ и Солянка — пара, чтобы оба состояния стояли рядом.
	</p>
</section>

<section class="skeletons__section">
	<h2 class="skeletons__title">Карточка меню и заглушка страницы</h2>
	<div class="skeletons__grid skeletons__grid--trio">
		<DishCard
			dish={load}
			forceLoading
			favorite={false}
			onFavorite={() => {}}
			onAdd={() => {}}
		/>
		<SkeletonCard />
		<SkeletonCard />
	</div>
	<p class="skeletons__note">
		Слева карточка в состоянии загрузки, дальше <code>SkeletonCard</code> — он же
		показывает избранное до гидрации. Если блоки должны выглядеть как одно и то же,
		это место, где видно разницу.
	</p>
</section>

<style>
	.skeletons__lead {
		margin-bottom: var(--space-8);
		color: var(--content-secondary);
		font-size: var(--text-label);
		letter-spacing: var(--tracking-wide);
	}

	.skeletons__section {
		margin-bottom: var(--space-9);
	}

	.skeletons__title {
		margin-bottom: var(--space-5);
		color: var(--content-secondary);
		font-size: var(--text-label);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}

	.skeletons__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		column-gap: var(--space-5);
		row-gap: var(--space-7);
	}

	.skeletons__grid--trio {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.skeletons__note {
		margin-top: var(--space-5);
		color: var(--content-ui);
		font-size: var(--text-meta);
		line-height: var(--leading-relaxed);
	}
</style>
