<script lang="ts">
	import { browser } from '$app/environment';
	import type { FFmpegApi } from '$lib/ffmpeg/ffmpeg-api';
	import { useFFmpeg } from '$lib/ffmpeg/FFmpegProvider.svelte';
	import EditorLoaded from './EditorLoaded.svelte';
	import FilePicker from './FilePicker.svelte';
	import { type TrackState } from './TimelineArea/TimelineArea.svelte';

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
		console.log(probeOutput);

		const audioStreams = probeOutput.streams.filter((stream) => stream.codec_type === 'audio');

		tracks = audioStreams.map((audioStream) => ({
			isUsed: true
		}));

		const audioStreamIds = audioStreams.map((_, id) => id);
		const streamExtractions = await ffmpeg.extractAudioStreams(file, audioStreamIds);

		for (let i = 0; i < audioStreams.length; i++) {
			const track = tracks[i];
			const extraction = streamExtractions[i];

			track.wavBuffer = extraction.wavBuffer;
		}
	}
</script>

{#if !$ffmpeg}
	<div class="loading">
		<p>Loading ffmpeg...</p>
	</div>
{:else if !file}
	<div class="loading">
		<FilePicker onPickFile={(pickedFile) => (file = pickedFile)} />
	</div>
{:else}
	<div>
		<EditorLoaded bind:file bind:tracks />
	</div>
{/if}

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		display: grid;

		&.loading {
			border: 1px solid scheme.var-color('primary');
			place-content: center;
		}
	}
</style>
