<script lang="ts">
	import IconArrowRight from "~icons/lucide/arrow-right";

	import TabHeading from "#lib/components/ui/TabHeading.svelte";
	import TextButton from "#lib/components/ui/TextButton.svelte";
	import DeliveryMap from "./DeliveryMap.svelte";
	import EtaPanel from "./EtaPanel.svelte";

	type Props = {
		cartIsEmpty: boolean;
		onOpenMenu: () => void;
	};

	let { cartIsEmpty, onOpenMenu }: Props = $props();
</script>

<TabHeading eyebrow="Твой заказ" title="В пути" />

<DeliveryMap />
<EtaPanel />

{#if cartIsEmpty}
	<TextButton variant="outline" onclick={onOpenMenu}>
		Выбрать что-нибудь красивое <IconArrowRight />
	</TextButton>
{/if}
