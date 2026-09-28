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
	import ResultTab from "#lib/components/features/ResultTab.svelte";

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
		const timer = setInterval(() => {
			now = Date.now();
		}, 1000);
		return () => clearInterval(timer);
	});

	$effect(() => {
		if (decided && !app.order) goto("/cart");
	});
</script>

<svelte:head>
	<title>Заказ — В Домике</title>
</svelte:head>

{#if decided}
	{#if phase === "delivered"}
		<ResultTab onDone={() => app.clearOrder()} />
	{:else}
		<DeliveryTab
			lines={app.orderLines}
			total={app.orderTotal}
			{phase}
			{remaining}
		/>
	{/if}
{/if}
