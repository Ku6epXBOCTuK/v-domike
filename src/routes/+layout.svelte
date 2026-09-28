<script lang="ts">
	import { asset, resolve } from "$app/paths";
	import { dev } from "$app/env";
	import { onMount } from "svelte";
	import favicon from "#lib/assets/favicon.svg";
	import { app } from "#lib/state/app.svelte.js";
	import AppHeader from "#lib/components/app/AppHeader.svelte";
	import AppShell from "#lib/components/app/AppShell.svelte";
	import BottomNav from "#lib/components/app/BottomNav.svelte";
	import NotifyIconButton from "#lib/components/app/NotifyIconButton.svelte";
	import ThemeToggleButton from "#lib/components/app/ThemeToggleButton.svelte";
	import Wordmark from "#lib/components/app/Wordmark.svelte";
	import "#lib/styles/tokens.css";
	import "#lib/styles/base.css";

	let { children } = $props();

	onMount(() => {
		if (dev || !("serviceWorker" in navigator)) return;
		const root = new URL(resolve("/"), location.href);
		navigator.serviceWorker.register(new URL("service-worker.js", root));
	});
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="В Домике" />
	<meta property="og:title" content="В Домике — уютная доставка" />
	<meta
		property="og:description"
		content="Уютный симулятор доставки блюд для спокойного вечера."
	/>
	<meta property="og:image" content={asset("og.jpg")} />
	<meta property="og:image:width" content="2400" />
	<meta property="og:image:height" content="1260" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<AppShell>
	{#snippet header()}
		<AppHeader>
			{#snippet brand()}
				<Wordmark />
			{/snippet}
			{#snippet actions()}
				<ThemeToggleButton />
				<NotifyIconButton />
			{/snippet}
		</AppHeader>
	{/snippet}

	{@render children()}

	{#snippet nav()}
		<BottomNav badgeOn={!app.isCartEmpty || app.order ? "order" : null} />
	{/snippet}
</AppShell>
