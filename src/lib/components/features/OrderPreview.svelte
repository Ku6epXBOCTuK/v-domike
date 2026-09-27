<script lang="ts">
	import IconChevronDown from "~icons/lucide/chevron-down";

	import type { CartEntry } from "#lib/state/app.svelte.js";
	import DishThumb from "./DishThumb.svelte";

	type Props = {
		lines: CartEntry[];
		total: number;
	};

	let { lines, total }: Props = $props();

	let open = $state(false);
</script>

<div class="preview">
	<button
		type="button"
		class="preview__toggle"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		Посмотреть, что принесут
		<IconChevronDown />
	</button>

	{#if open}
		<ul class="preview__lines">
			{#each lines as line (line.dish.id)}
				<li class="preview__line">
					<DishThumb dish={line.dish} />
					<div class="preview__body">
						<p class="preview__name">{line.dish.name}</p>
						{#if line.count > 1}
							<p class="preview__count">{line.count}</p>
						{/if}
					</div>
					<p class="preview__sum">{line.dish.price * line.count} ✦</p>
				</li>
			{/each}
		</ul>
		<p class="preview__total">
			<span>Итого</span>
			<span>{total} ✦</span>
		</p>
	{/if}
</div>

<style>
	.preview {
		margin-top: var(--space-6);
	}

	.preview__toggle {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--content-accent-soft);
		font-size: var(--text-meta);
		letter-spacing: var(--tracking-wide);
		transition: color var(--duration-fast) ease;
	}

	.preview__toggle:hover {
		color: var(--content-accent-strong);
	}

	.preview__toggle :global(svg) {
		width: 14px;
		height: 14px;
		transition: transform var(--duration-fast) var(--ease-out);
	}

	.preview__toggle[aria-expanded="true"] :global(svg) {
		transform: rotate(180deg);
	}

	.preview__lines {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-top: var(--space-6);
	}

	.preview__line {
		display: flex;
		align-items: center;
		gap: var(--space-5);
	}

	.preview__body {
		flex: 1;
		min-width: 0;
	}

	.preview__name {
		color: var(--content-primary);
		font-family: var(--font-display);
		font-size: var(--text-card);
		line-height: var(--leading-tight);
	}

	.preview__count {
		margin-top: var(--space-1);
		color: var(--content-secondary);
		font-size: var(--text-label);
		letter-spacing: var(--tracking-wide);
	}

	.preview__sum {
		color: var(--content-accent-soft);
		font-size: var(--text-meta);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
	}

	.preview__total {
		display: flex;
		justify-content: space-between;
		gap: var(--space-6);
		margin-top: var(--space-6);
		padding-top: var(--space-5);
		border-top: 1px solid var(--border-subtle);
		color: var(--content-secondary);
		font-size: var(--text-meta);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}
</style>
