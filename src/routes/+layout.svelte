<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Overlay from '$lib/components/Tooltip/Overlay.svelte';
	import '$lib/style/global.scss';
	import '@fontsource-variable/montserrat';
	import '@fontsource/arvo';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<Overlay />

<Header />

{@render children()}

<!-- <Footer /> -->
