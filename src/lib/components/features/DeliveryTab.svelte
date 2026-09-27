<script lang="ts">
	import type { CartEntry, OrderPhase } from "#lib/state/app.svelte.js";
	import TabHeading from "#lib/components/ui/TabHeading.svelte";
	import DeliveryMap from "./DeliveryMap.svelte";
	import EtaPanel from "./EtaPanel.svelte";
	import OrderPreview from "./OrderPreview.svelte";

	type Props = {
		lines: CartEntry[];
		total: number;
		phase: OrderPhase;
		remaining: number;
	};

	let { lines, total, phase, remaining }: Props = $props();
</script>

<TabHeading eyebrow="Твой заказ" title="В пути" />

<DeliveryMap />
<EtaPanel {phase} {remaining} />
<OrderPreview {lines} {total} />
