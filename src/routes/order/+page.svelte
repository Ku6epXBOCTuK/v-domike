<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

	import {
		app,
		COOK_MS,
		DELIVER_MS,
		orderPhase,
	} from "#lib/state/app.svelte.js";
	import DeliveryTab from "#lib/components/features/DeliveryTab.svelte";

	/*
	 * Страница заказа ничего не показывает сама: статус живёт в localStorage, а
	 * страница пререндерена, поэтому решение принимается на клиенте. Заказа нет —
	 * уводим в корзину. Заказ есть — показываем доставку, и на «доставлено» тоже
	 * доставку: тот, кто прождал десять минут, не должен попасть в пустую
	 * корзину. Отдельный экран результата появится следующим шагом.
	 */
	let decided = $state(false);
	let now = $state(0);

	const phase = $derived(
		app.order ? orderPhase(app.order.placedAt, now || Date.now()) : "delivered",
	);

	const remaining = $derived(
		app.order
			? Math.max(
					0,
					phase === "cooking"
						? app.order.placedAt + COOK_MS - now
						: app.order.placedAt + COOK_MS + DELIVER_MS - now,
				)
			: 0,
	);

	onMount(() => {
		now = Date.now();
		decided = true;
		if (!app.order) goto("/cart");
		const timer = setInterval(() => {
			now = Date.now();
		}, 1000);
		return () => clearInterval(timer);
	});
</script>

<svelte:head>
	<title>Заказ — В Домике</title>
</svelte:head>

{#if decided}
	<DeliveryTab
		lines={app.orderLines}
		total={app.orderTotal}
		{phase}
		{remaining}
	/>
{/if}
