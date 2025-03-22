<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '$lib/style/global.scss';
	import '@fontsource-variable/montserrat';
	import '@fontsource/arvo';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<Header />

{@render children()}

<!-- <Footer /> -->
