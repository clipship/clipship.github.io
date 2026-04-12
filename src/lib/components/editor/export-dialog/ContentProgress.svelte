<script lang="ts">
	import { pageState } from '$lib/client-state/page-state.svelte';

	interface Props {
		progress?: number;
	}

	let { progress }: Props = $props();

	pageState.useTitleWhileMounted(() => {
		if (!progress) {
			return 'Exporting - Initializing...';
		} else {
			return `Exporting - ${Math.round(progress * 100)}%`;
		}
	});
</script>

{#if !progress}
	<p>Initializing...</p>
{:else}
	<p>Progress: {(progress * 100).toFixed(1)}%</p>
{/if}

<style lang="scss">
	p {
		text-align: center;
	}
</style>
