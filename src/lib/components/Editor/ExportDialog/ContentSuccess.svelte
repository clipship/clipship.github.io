<script lang="ts">
	import type { FFprobeOutput } from '$lib/ffmpeg/ffmpeg-api';
	import { onMount } from 'svelte';
	import { VideoFormats, type ValidFormat } from '../formats';

	export interface ExportSuccess {
		outputFormat: ValidFormat;
		outputBlobUrl: string;
		outputFileName: string;
		metadata: FFprobeOutput;
	}

	type Props = ExportSuccess;

	let { outputFormat, outputBlobUrl, metadata }: Props = $props();

	onMount(() => {
		console.log('Displaying success with metadata', $state.snapshot(metadata));
	});
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
