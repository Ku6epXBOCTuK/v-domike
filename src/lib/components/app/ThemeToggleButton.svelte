<script lang="ts">
	import IconMoon from "~icons/lucide/moon";
	import IconSun from "~icons/lucide/sun";

	import { app } from "#lib/state/app.svelte.js";
</script>

<button
	type="button"
	class="theme-toggle"
	aria-label={app.theme === "dark"
		? "Включить светлую тему"
		: "Включить кавайную тёмную тему"}
	onclick={() => app.toggleTheme()}
>
	{#if app.theme === "dark"}
		<IconSun />
	{:else}
		<IconMoon />
	{/if}
</button>

<style>
	.theme-toggle {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-pill);
		background: var(--surface-warm);
		color: var(--content-accent-soft);
		transition:
			background-color var(--duration-fast) ease,
			color var(--duration-fast) ease,
			transform var(--duration-fast) var(--ease-out);
	}

	.theme-toggle:hover {
		transform: rotate(-10deg) scale(1.04);
	}

	.theme-toggle :global(svg) {
		width: 16px;
		height: 16px;
	}
</style>
