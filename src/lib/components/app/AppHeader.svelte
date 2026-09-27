<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		brand: Snippet;
		actions: Snippet;
	};

	let { brand, actions }: Props = $props();
</script>

<header class="app-header">
	{@render brand()}
	<div class="app-header__actions">
		{@render actions()}
	</div>
</header>

<style>
	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding-block: calc(var(--safe-top) + var(--space-8)) var(--space-4);
		padding-inline: max(var(--space-8), var(--safe-left))
			max(var(--space-8), var(--safe-right));
	}

	.app-header__actions {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}
</style>
