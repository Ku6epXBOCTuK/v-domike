<script lang="ts">
	import IconBell from "~icons/lucide/bell";

	import EmptyState from "#lib/components/ui/EmptyState.svelte";
	import TabHeading from "#lib/components/ui/TabHeading.svelte";
</script>

<TabHeading eyebrow="Настройки" title="Уведомления" />

<EmptyState icon={IconBell} title="Здесь пока тихо">
	<p>
		Настройки появятся позже. Пока приложение ничего не присылает и не шумит —
		так спокойнее.
	</p>
</EmptyState>
