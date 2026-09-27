<script lang="ts">
	import TabHeading from "#lib/components/ui/TabHeading.svelte";
	import DeliveryMap from "./DeliveryMap.svelte";
	import EtaPanel from "./EtaPanel.svelte";
</script>

<TabHeading eyebrow="Твой заказ" title="В пути" />

<DeliveryMap />
<EtaPanel />
