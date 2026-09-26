<script lang="ts">
	type Props = {
		eyebrow: string;
		title: string;
		accent?: string;
	};

	let { eyebrow, title, accent }: Props = $props();
</script>

<div class="tab-heading">
	<p class="tab-heading__eyebrow">{eyebrow}</p>
	<h1 class="tab-heading__title">
		{#if accent}{title}<br /><span class="tab-heading__accent">{accent}</span
			>{:else}{title}{/if}
	</h1>
</div>

<style>
	.tab-heading {
		margin-bottom: var(--space-7);
	}

	.tab-heading__eyebrow {
		margin-bottom: var(--space-5);
		color: var(--content-secondary);
		font-size: var(--text-meta);
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
	}

	.tab-heading__title {
		color: var(--content-primary);
		font-family: var(--font-display);
		font-size: var(--text-display);
		font-weight: var(--weight-regular);
		line-height: var(--leading-heading);
		letter-spacing: var(--tracking-display);
	}

	.tab-heading__accent {
		color: var(--content-accent);
		font-style: italic;
	}
</style>
