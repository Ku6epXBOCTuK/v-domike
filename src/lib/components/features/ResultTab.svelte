<script lang="ts">
	import TabHeading from "#lib/components/ui/TabHeading.svelte";
	import PrimaryButton from "#lib/components/ui/PrimaryButton.svelte";

	type Props = {
		onDone: () => void;
	};

	let { onDone }: Props = $props();
</script>

<TabHeading eyebrow="Всё доставлено" title="Можно выдохнуть" />

<p class="result__note">И никуда не спешить.</p>

<PrimaryButton onclick={onDone}>Хорошо</PrimaryButton>

<style>
	.result__note {
		margin-top: var(--space-5);
		margin-bottom: var(--space-9);
		color: var(--content-secondary);
		font-size: var(--text-meta);
		line-height: var(--leading-relaxed);
	}
</style>
