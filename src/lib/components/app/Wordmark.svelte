<script lang="ts">
	type Props = {
		onselect: () => void;
	};

	let { onselect }: Props = $props();
</script>

<button type="button" class="wordmark" {onselect}>
	<span class="wordmark__name"
		>virtual<span class="wordmark__accent">bite</span></span
	>
	<span class="wordmark__tagline">private dining</span>
</button>

<style>
	.wordmark {
		display: block;
		text-align: left;
		color: var(--content-primary);
	}

	.wordmark__name {
		font-family: var(--font-display);
		font-size: var(--text-wordmark);
		line-height: var(--leading-none);
		letter-spacing: var(--tracking-wordmark);
	}

	.wordmark__accent {
		color: var(--content-accent-strong);
	}

	.wordmark__tagline {
		margin-left: var(--space-4);
		color: var(--content-secondary);
		font-size: var(--text-badge);
		letter-spacing: var(--tracking-brand);
		text-transform: uppercase;
	}
</style>
