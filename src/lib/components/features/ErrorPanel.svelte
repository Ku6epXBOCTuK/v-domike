<script lang="ts">
	import IconArrowRight from "~icons/lucide/arrow-right";
	import IconCompass from "~icons/lucide/compass";

	import EmptyState from "#lib/components/ui/EmptyState.svelte";
	import TabHeading from "#lib/components/ui/TabHeading.svelte";
	import TextButton from "#lib/components/ui/TextButton.svelte";

	type Props = {
		status: number;
	};

	let { status }: Props = $props();

	const copy = $derived(
		status === 404
			? {
					eyebrow: "Ничего не нашлось",
					title: "Здесь пока",
					accent: "тихо",
					note: "Кажется, такой страницы здесь и не было. Ничего не пропало: меню рядом, и там всё на месте.",
				}
			: {
					eyebrow: "Что-то не так",
					title: "Здесь что-то",
					accent: "споткнулось",
					note: "Страница не открылась. Ничего страшного: можно вернуться к меню и начать сначала.",
				},
	);
</script>

<TabHeading eyebrow={copy.eyebrow} title={copy.title} accent={copy.accent} />

<EmptyState icon={IconCompass} title="Можно выдохнуть">
	<p>{copy.note}</p>
	<TextButton variant="outline" href="/"
		>Вернуться к меню <IconArrowRight /></TextButton
	>
</EmptyState>
