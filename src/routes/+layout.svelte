<script lang="ts">
	import favicon from "#lib/assets/favicon.svg";
	import "#lib/styles/tokens.css";
	import "#lib/styles/base.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />
</svelte:head>

{@render children()}
