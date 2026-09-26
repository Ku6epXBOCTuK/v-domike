<script lang="ts">
	import { page } from "$app/state";

	import ErrorPanel from "#lib/components/features/ErrorPanel.svelte";

	const isMissing = $derived(page.status === 404);
</script>

<svelte:head>
	<title>
		{isMissing ? "Страница не нашлась" : "Что-то не получилось"} — В Домике
	</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<ErrorPanel status={page.status} />
