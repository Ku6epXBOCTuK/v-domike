<script lang="ts">
	import { app } from "#lib/state/app.svelte.js";
	import CartTab from "#lib/components/features/CartTab.svelte";
</script>

<svelte:head>
	<title>Корзина — В Домике</title>
</svelte:head>

<CartTab
	lines={app.cartLines}
	total={app.cartTotal}
	onAdd={(id) => app.add(id)}
	onRemove={(id) => app.remove(id)}
/>
