<script lang="ts">
	import { browser } from '$app/environment';
	import type { FFmpegApi } from '../util/ffmpeg-api';
	import { useFFmpeg } from '../util/FFmpegProvider.svelte';
	import TimelineArea, { type TrackState } from './TimelineArea/TimelineArea.svelte';
	import VideoArea from './VideoArea.svelte';

	const { ffmpeg, startLoading } = useFFmpeg();

	if (browser) {
		startLoading();
	}

	let file = $state<File>();
	let tracks = $state<TrackState[]>([]);

	$effect(() => {
		const loadedFFmpeg = $ffmpeg;

		if (loadedFFmpeg) {
			loadedFFmpeg.enableLogging = true;

			if (file) {
				loadFile(loadedFFmpeg, file);
			}
		}
	});

	async function loadFile(ffmpeg: FFmpegApi, file: File) {
		const probeOutput = await ffmpeg.probe(file);

		const audioStreams = probeOutput.streams.filter((stream) => stream.codec_type === 'audio');

		tracks = audioStreams.map((audioStream) => ({
			isUsed: true
		}));

		for (let i = 0; i < audioStreams.length; i++) {
			const track = tracks[i];

			ffmpeg.extractAudioPeaks(file, i).then((pcmData) => {
				track.pcmData = pcmData;
				console.log('Loaded peaks for stream', i);
			});
		}
	}
</script>

{#if !$ffmpeg}
	<div class="loading">
		<p>Loading ffmpeg...</p>
	</div>
{:else}
	<div>
		<VideoArea bind:file />
		{#if tracks.length > 0}
			<TimelineArea bind:tracks />
		{/if}
	</div>
{/if}

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		display: grid;
		grid-template-rows: 1fr auto;
		gap: 4px;

		&.loading {
			grid-template-rows: auto;
			place-content: center;
		}
	}
</style>
