<script lang="ts">
	import { app } from "#lib/state/app.svelte.js";
	import OrderTab from "#lib/components/features/OrderTab.svelte";
</script>

<svelte:head>
	<title>Заказ — В Домике</title>
</svelte:head>

<OrderTab cartIsEmpty={app.isCartEmpty} />
