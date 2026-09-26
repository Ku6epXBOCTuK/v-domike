<script lang="ts">
	import IconBell from "~icons/lucide/bell";
	import IconMoon from "~icons/lucide/moon";
	import IconSun from "~icons/lucide/sun";

	import favicon from "#lib/assets/favicon.svg";
	import { app } from "#lib/state/app.svelte.js";
	import AppHeader from "#lib/components/app/AppHeader.svelte";
	import AppShell from "#lib/components/app/AppShell.svelte";
	import BottomNav from "#lib/components/app/BottomNav.svelte";
	import Wordmark from "#lib/components/app/Wordmark.svelte";
	import IconButton from "#lib/components/ui/IconButton.svelte";
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

	{@render children()}

	{#snippet nav()}
		<BottomNav badgeOn={app.cartCount > 0 ? "order" : null} />
	{/snippet}
</AppShell>
