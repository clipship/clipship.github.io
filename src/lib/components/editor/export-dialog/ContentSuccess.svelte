<script lang="ts">
	import { pageState } from '$lib/client-state/page-state.svelte';
	import { VideoFormats, type ValidFormat } from '../formats';

	interface Props {
		outputFormat: ValidFormat;
		outputBlobUrl: string;
	}

	let { outputFormat, outputBlobUrl }: Props = $props();

	pageState.useTitleWhileMounted(() => 'Exporting - Done!');
</script>

<div>
	<p>Success!</p>

	{#if outputFormat in VideoFormats}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video controls src={outputBlobUrl}></video>
	{:else}
		<audio controls src={outputBlobUrl}></audio>
	{/if}
</div>

<style lang="scss">
	div {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	video {
		max-width: 100%;
	}
</style>
