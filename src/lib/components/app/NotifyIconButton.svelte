<script lang="ts">
	import { resolve } from "$app/paths";
	import IconBell from "~icons/lucide/bell";

	type Props = {
		dot?: boolean;
	};

	let { dot = false }: Props = $props();
</script>

<a
	class="notify"
	aria-label="Уведомления"
	href={resolve("/profile/notifications")}
>
	<IconBell />
	{#if dot}<span class="notify__dot"></span>{/if}
</a>

<style>
	.notify {
		position: relative;
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-pill);
		color: var(--content-ui);
		text-decoration: none;
		transition:
			background-color var(--duration-fast) ease,
			color var(--duration-fast) ease;
	}

	.notify:hover {
		background: var(--surface-sunken);
	}

	.notify :global(svg) {
		width: 16px;
		height: 16px;
	}

	.notify__dot {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 6px;
		height: 6px;
		border-radius: var(--radius-pill);
		background: var(--content-accent);
	}
</style>
