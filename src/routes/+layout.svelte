<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '$lib/style/global.scss';
	import '@fontsource-variable/montserrat';
	import '@fontsource/arvo';
	import type { Snippet } from 'svelte';
	import { PortalOverlay } from 'svelte-tether';

	let { children: layoutChildren }: { children: Snippet } = $props();
</script>

<PortalOverlay>
	{#snippet children({ hasModals })}
		<div inert={hasModals}>
			<Header />

			{@render layoutChildren()}

			<!-- <Footer /> -->
		</div>
	{/snippet}
</PortalOverlay>

<style lang="scss">
	div {
		display: contents;
	}
</style>
