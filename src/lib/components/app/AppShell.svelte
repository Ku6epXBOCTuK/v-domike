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
		/* Свет держится у верхнего левого угла экрана, а не растягивается на всю
		   высоту страницы: на длинном меню градиент иначе размазывается в ровную
		   заливку. `fixed` держит его на экране при прокрутке, а `size` остаётся
		   страховкой для браузеров, которые его игнорируют. */
		background: radial-gradient(
			circle var(--canvas-glow-radius) at var(--canvas-glow-at),
			var(--surface-canvas-glow) 0,
			transparent var(--canvas-glow-extent)
		);
		background-repeat: no-repeat;
		background-size: 100% 100dvh;
		background-attachment: fixed;
		color: var(--content-primary);
	}

	.app__frame {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	.app__content {
		flex: 1;
		padding-block: var(--space-7) var(--content-bottom-pad);
		padding-inline: max(var(--space-8), var(--safe-left))
			max(var(--space-8), var(--safe-right));
	}

	@media (min-width: 640px) {
		.app {
			padding: var(--space-9) var(--space-10);
		}

		.app__frame {
			overflow: hidden;
			max-width: var(--frame-max);
			min-height: var(--frame-min-height);
			margin-inline: auto;
			background: var(--surface-base);
			border: 1px solid var(--border-strong);
			border-radius: var(--radius-2xl);
			box-shadow: var(--shadow-shell);
		}

		.app__content {
			padding-inline: var(--space-8);
		}
	}
</style>
