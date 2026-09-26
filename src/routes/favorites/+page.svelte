<script lang="ts">
	import { app } from "#lib/state/app.svelte.js";
	import FavoritesTab from "#lib/components/features/FavoritesTab.svelte";
</script>

<svelte:head>
	<title>Любимое — В Домике</title>
</svelte:head>

<FavoritesTab
	dishes={app.favoriteDishes}
	onFavorite={(id) => app.toggleFavorite(id)}
	onAdd={(id) => app.add(id)}
/>
