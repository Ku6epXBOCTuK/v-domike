<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

	import IconShoppingBasket from "~icons/lucide/shopping-basket";

	import { app } from "#lib/state/app.svelte.js";
	import EmptyState from "#lib/components/ui/EmptyState.svelte";

	/*
	 * Пока экран доставки не трогаем, /order работает как заглушка: отправляет в
	 * корзину, если там что-то есть, иначе показывает курьера. Настоящий
	 * распределитель по фазам — следующий шаг.
	 */
	onMount(() => {
		if (!app.isCartEmpty) goto("/cart");
	});
</script>

<svelte:head>
	<title>Заказ — В Домике</title>
</svelte:head>

<EmptyState icon={IconShoppingBasket} title="Здесь пока тихо" />
