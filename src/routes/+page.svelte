<script lang="ts">
	import { app } from "#lib/state/app.svelte.js";
	import MenuTab from "#lib/components/features/MenuTab.svelte";
</script>

<svelte:head>
	<title>В Домике — уютная доставка</title>
	<meta
		name="description"
		content="Уютный симулятор доставки блюд для спокойного вечера."
	/>
	<meta name="color-scheme" content="light dark" />
	<meta
		name="theme-color"
		content="#f2e8df"
		media="(prefers-color-scheme: light)"
	/>
	<meta
		name="theme-color"
		content="#211b2b"
		media="(prefers-color-scheme: dark)"
	/>
</svelte:head>

<MenuTab
	dishes={app.visibleDishes}
	category={app.category}
	favoriteIds={app.favoriteIds}
	cartIsEmpty={app.isCartEmpty}
	onCategory={(id) => (app.category = id)}
	onFavorite={(id) => app.toggleFavorite(id)}
	onAdd={(id) => app.add(id)}
/>
