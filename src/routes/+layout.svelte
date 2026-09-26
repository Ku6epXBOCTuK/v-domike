<script lang="ts">
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
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />
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
		<BottomNav badgeOn={app.cartCount > 0 ? "order" : null} />
	{/snippet}
</AppShell>
