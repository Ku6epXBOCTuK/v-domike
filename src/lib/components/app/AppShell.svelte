<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		header: Snippet;
		children: Snippet;
		nav: Snippet;
	};

	let { header, children, nav }: Props = $props();
</script>

<main class="app">
	<div class="app__frame">
		{@render header()}
		<div class="app__content">
			{@render children()}
		</div>
		{@render nav()}
	</div>
</main>

<style>
	.app {
		min-height: 100dvh;
		background: var(--surface-base);
		color: var(--content-primary);
	}

	.app__frame {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		background: var(--surface-base);
	}

	.app__content {
		flex: 1;
		padding-block: var(--space-7) var(--content-bottom-pad);
		padding-inline: max(var(--space-8), var(--safe-left))
			max(var(--space-8), var(--safe-right));
	}

	/* Карточка с полями, рамкой и тенью — это превью телефона на десктопе. На
	   узком экране тот же приём дал бы телефон внутри телефона, поэтому базовые
	   правила выше занимают весь экран, а карточка появляется только здесь. */
	@media (min-width: 640px) {
		.app {
			padding: var(--space-9) var(--space-10);
			background:
				radial-gradient(
					circle at var(--canvas-glow-at),
					var(--surface-canvas-glow) 0,
					transparent var(--canvas-glow-extent)
				),
				var(--surface-canvas);
		}

		.app__frame {
			overflow: hidden;
			max-width: var(--frame-max);
			min-height: var(--frame-min-height);
			margin-inline: auto;
			border: 1px solid var(--border-strong);
			border-radius: var(--radius-2xl);
			box-shadow: var(--shadow-shell);
		}

		.app__content {
			padding-inline: var(--space-8);
		}
	}
</style>
