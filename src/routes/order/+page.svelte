<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

	import { app, orderPhase } from "#lib/state/app.svelte.js";
	import DeliveryTab from "#lib/components/features/DeliveryTab.svelte";

	/*
	 * Страница заказа ничего не показывает сама: статус живёт в localStorage, а
	 * страница пререндерена, поэтому решение принимается на клиенте. Пока
	 * заказ оформлен и не доставлен — экран доставки, иначе уводим в корзину.
	 * Ветка «доставлено» появится вместе с экраном результата.
	 */
	let decided = $state(false);

	onMount(() => {
		decided = true;
		if (
			!app.order ||
			orderPhase(app.order.placedAt, Date.now()) === "delivered"
		) {
			goto("/cart");
		}
	});
</script>

<svelte:head>
	<title>Заказ — В Домике</title>
</svelte:head>

{#if decided}
	<DeliveryTab />
{/if}
