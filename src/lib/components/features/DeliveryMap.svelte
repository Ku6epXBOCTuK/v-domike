<script lang="ts">
	import IconHouse from "~icons/lucide/house";
	import IconNavigation from "~icons/lucide/navigation";

	import MapMarker from "./MapMarker.svelte";
</script>

<div class="delivery-map">
	<div class="delivery-map__grid"></div>
	<div class="delivery-map__route"></div>
	<div class="delivery-map__dot"></div>

	<div class="delivery-map__slot delivery-map__slot--home">
		<MapMarker variant="home" icon={IconHouse} label="Дом" />
	</div>
	<div class="delivery-map__slot delivery-map__slot--courier">
		<MapMarker variant="courier" icon={IconNavigation} label="Курьер Минсу" />
	</div>

	<p class="delivery-map__caption">Курьер Минсу уже близко</p>
</div>

<style>
	.delivery-map {
		position: relative;
		height: var(--delivery-map-height);
		margin-bottom: var(--space-7);
		overflow: hidden;
		border-radius: var(--radius-lg);
		background: var(--surface-map);
	}

	.delivery-map__grid {
		position: absolute;
		inset: 0;
		background-image:
			repeating-linear-gradient(
				0deg,
				var(--map-grid-line) 0 1px,
				transparent 1px var(--map-grid-size)
			),
			repeating-linear-gradient(
				90deg,
				var(--map-grid-line) 0 1px,
				transparent 1px var(--map-grid-size)
			);
	}

	.delivery-map__route {
		position: absolute;
		top: 68%;
		left: 20%;
		width: 65%;
		height: 1px;
		background: var(--content-accent-strong);
		transform: rotate(var(--map-route-angle));
	}

	.delivery-map__dot {
		position: absolute;
		top: 68%;
		left: 20%;
		width: 12px;
		height: 12px;
		border-radius: var(--radius-pill);
		background: var(--content-accent-strong);
		box-shadow: 0 0 0 var(--map-ring-width) var(--surface-sunken);
	}

	.delivery-map__slot {
		position: absolute;
	}

	.delivery-map__slot--home {
		top: 18%;
		right: 10%;
	}

	.delivery-map__slot--courier {
		top: 46%;
		left: 49%;
	}

	.delivery-map__caption {
		position: absolute;
		bottom: var(--space-6);
		left: var(--space-6);
		padding: var(--space-4) var(--space-5);
		border-radius: var(--radius-sm);
		background: var(--surface-glass);
		backdrop-filter: blur(8px);
		color: var(--content-ui);
		font-size: var(--text-label);
	}
</style>
