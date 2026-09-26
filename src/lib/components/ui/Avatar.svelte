<script lang="ts">
	type Props = {
		initial: string;
	};

	let { initial }: Props = $props();
</script>

<span class="avatar">{initial}</span>

<style>
	.avatar {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		border: 1px solid var(--content-accent-soft);
		border-radius: var(--radius-pill);
		color: var(--content-inverse);
		font-family: var(--font-display);
		font-size: var(--text-emphasis);
	}
</style>
