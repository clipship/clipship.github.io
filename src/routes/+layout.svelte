<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '$lib/style/global.scss';
	import '@fontsource-variable/montserrat';
	import '@fontsource/arvo';
	import type { Snippet } from 'svelte';
	import { PortalOverlay, TetherBoundary } from 'svelte-tether';

	let { children: layoutChildren }: { children: Snippet } = $props();
</script>

<PortalOverlay>
	{#snippet children({ hasModals })}
		<TetherBoundary attributes={{ class: 'boundary', inert: hasModals }}>
			<Header />

			{@render layoutChildren()}

			<!-- <Footer /> -->
		</TetherBoundary>
	{/snippet}
</PortalOverlay>
