<script lang="ts">
	import IconBell from "~icons/lucide/bell";
	import IconMoon from "~icons/lucide/moon";
	import IconSun from "~icons/lucide/sun";

	import type { CategoryId } from "#lib/data/dishes.js";
	import { createAppState } from "#lib/state/app.svelte.js";
	import AppHeader from "#lib/components/app/AppHeader.svelte";
	import AppShell from "#lib/components/app/AppShell.svelte";
	import BottomNav from "#lib/components/app/BottomNav.svelte";
	import Wordmark from "#lib/components/app/Wordmark.svelte";
	import FavoritesTab from "#lib/components/features/FavoritesTab.svelte";
	import MenuTab from "#lib/components/features/MenuTab.svelte";
	import OrderTab from "#lib/components/features/OrderTab.svelte";
	import ProfileTab from "#lib/components/features/ProfileTab.svelte";
	import IconButton from "#lib/components/ui/IconButton.svelte";

	const app = createAppState();
</script>

<svelte:head>
	<title>VirtualBite — уют рядом</title>
	<meta
		name="description"
		content="Виртуальная доставка уютных блюд для спокойного вечера."
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

<AppShell>
	{#snippet header()}
		<AppHeader>
			{#snippet brand()}
				<Wordmark onselect={() => (app.tab = "menu")} />
			{/snippet}
			{#snippet actions()}
				<IconButton
					tone="warm"
					label={app.theme === "dark"
						? "Включить светлую тему"
						: "Включить кавайную тёмную тему"}
					onclick={() => app.toggleTheme()}
				>
					{#if app.theme === "dark"}
						<IconSun />
					{:else}
						<IconMoon />
					{/if}
				</IconButton>
				<IconButton tone="plain" label="Уведомления" dot>
					<IconBell />
				</IconButton>
			{/snippet}
		</AppHeader>
	{/snippet}

	{#key app.tab}
		<div class="tab">
			{#if app.tab === "menu"}
				<MenuTab
					dishes={app.visibleDishes}
					category={app.category}
					favoriteIds={app.favoriteIds}
					cartIsEmpty={app.isCartEmpty}
					onCategory={(id: CategoryId) => (app.category = id)}
					onFavorite={(id) => app.toggleFavorite(id)}
					onAdd={(id) => app.add(id)}
					onOpenOrder={() => (app.tab = "order")}
				/>
			{:else if app.tab === "order"}
				<OrderTab
					cartIsEmpty={app.isCartEmpty}
					onOpenMenu={() => (app.tab = "menu")}
				/>
			{:else if app.tab === "favorites"}
				<FavoritesTab
					dishes={app.favoriteDishes}
					onFavorite={(id) => app.toggleFavorite(id)}
					onAdd={(id) => app.add(id)}
				/>
			{:else}
				<ProfileTab />
			{/if}
		</div>
	{/key}

	{#snippet nav()}
		<BottomNav
			active={app.tab}
			badgeOn={app.cartCount > 0 ? "order" : null}
			onselect={(tab) => (app.tab = tab)}
		/>
	{/snippet}
</AppShell>

<style>
	@keyframes tab-in {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	/* {#key app.tab} пересоздаёт обёртку при смене таба, поэтому анимация
	   перезапускается. Сделано на CSS--keyframes, а не на svelte/transition,
	   чтобы правило prefers-reduced-motion в base.css гасило её и здесь. */
	.tab {
		animation: tab-in var(--duration-slow) var(--ease-out);
	}
</style>
