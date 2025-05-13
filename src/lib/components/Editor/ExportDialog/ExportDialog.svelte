<script lang="ts">
	import { useFFmpeg } from '$lib/ffmpeg/FFmpegProvider.svelte';
	import ElevatedButton from '../../ElevatedButton.svelte';
	import Dialog from '../../Overlay/Dialog.svelte';
	import { editorPreferences } from '../preferences.svelte';
	import type { RangeInterval } from '../TimelineArea/interval-space';
	import type { TrackState } from '../TimelineArea/TimelineArea.svelte';
	import ContentProgress from './ContentProgress.svelte';
	import ContentSettings from './ContentSettings.svelte';

	type Phase = 'configuring' | 'exporting' | 'done';

	interface Props {
		visible: boolean;

		file: File;
		tracks: TrackState[];
		markingRange: RangeInterval;
		videoDuration: number;
	}

	let { visible = $bindable(), file, tracks, markingRange, videoDuration }: Props = $props();

	let isTrimmingActive = $derived(markingRange.start > 0 || markingRange.end < 1);
	let clipDuration = $derived((markingRange.end - markingRange.start) * videoDuration);
	let activeTracks = $derived(tracks.filter((track) => track.isUsed));

	let phase = $state<Phase>('configuring');

	const settings = editorPreferences.export;

	const { ffmpeg } = useFFmpeg();

	async function exportClip() {
		phase = 'exporting';

		try {
			const { outputFileInFFmpeg } = await $ffmpeg!.convert(file, {
				mode: settings.includeVideo
					? { outputFormat: settings.videoFormat, includeVideo: true }
					: { outputFormat: settings.audioFormat, includeVideo: false },
				audio: {
					streamIds: activeTracks.map((_, id) => id),
					singleOutputStream: settings.singleAudioOutputStream
				},
				trimming: isTrimmingActive
					? {
							highPrecision: settings.videoExportMode === 're-encode',
							start: markingRange.start * videoDuration,
							end: markingRange.end * videoDuration
						}
					: undefined
			});

			phase = 'done';

			console.log('done');

			const probeResult = await $ffmpeg!.probe(outputFileInFFmpeg);
			console.log(probeResult);
		} catch (err) {
			phase = 'configuring';
			throw err;
		}
	}
</script>

<Dialog bind:visible title="Export">
	{#if phase === 'configuring'}
		<ContentSettings clipDurationInSeconds={clipDuration} trackCount={activeTracks.length} />
	{:else if phase === 'exporting'}
		<ContentProgress progress={0} />
	{/if}

	{#snippet actions()}
		{#if !phase}
			<ElevatedButton color="secondary" onclick={exportClip}>Export</ElevatedButton>
		{/if}
	{/snippet}
</Dialog>
