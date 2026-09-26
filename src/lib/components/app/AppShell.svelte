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
		padding: var(--space-5);
		background:
			radial-gradient(
				circle at var(--canvas-glow-at),
				var(--surface-canvas-glow) 0,
				transparent var(--canvas-glow-extent)
			),
			var(--surface-canvas);
		color: var(--content-primary);
	}

	.app__frame {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		max-width: var(--frame-max);
		min-height: calc(100dvh - 2 * var(--space-5));
		margin-inline: auto;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-2xl);
		background: var(--surface-base);
		box-shadow: var(--shadow-shell);
	}

	.app__content {
		flex: 1;
		padding: var(--space-7) var(--space-8) var(--content-bottom-pad);
	}

	@media (min-width: 640px) {
		.app {
			padding: var(--space-9) var(--space-10);
		}

		.app__frame {
			min-height: var(--frame-min-height);
		}
	}
</style>
