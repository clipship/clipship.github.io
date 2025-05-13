<script lang="ts">
	import { useFFmpeg } from '$lib/ffmpeg/FFmpegProvider.svelte';
	import ElevatedButton from '../../ElevatedButton.svelte';
	import Dialog from '../../Overlay/Dialog.svelte';
	import { AllFormats } from '../formats';
	import { editorPreferences } from '../preferences.svelte';
	import type { RangeInterval } from '../TimelineArea/interval-space';
	import type { TrackState } from '../TimelineArea/TimelineArea.svelte';
	import ContentSettings from './ContentConfigure.svelte';
	import ContentProgress from './ContentProgress.svelte';
	import ContentSuccess, { type ExportSuccess } from './ContentSuccess.svelte';

	type Phase =
		| { type: 'configuring' }
		| { type: 'exporting' }
		| { type: 'success'; result: ExportSuccess };

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

	let phase = $state<Phase>({ type: 'configuring' });

	const settings = editorPreferences.export;

	const { ffmpeg } = useFFmpeg();

	async function exportClip() {
		phase = { type: 'exporting' };

		const outputFormat = settings.includeVideo ? settings.videoFormat : settings.audioFormat;

		try {
			const { outputFileInFFmpeg, outputBuffer } = await $ffmpeg!.convert(file, {
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

			const probeResult = await $ffmpeg!.probe(outputFileInFFmpeg);

			const mimeType = AllFormats[outputFormat].mimeType;

			const blob = new Blob([outputBuffer], { type: mimeType });
			const blobUrl = URL.createObjectURL(blob);

			phase = {
				type: 'success',
				result: {
					outputBlobUrl: blobUrl,
					outputFormat: outputFormat,
					outputFileName: outputFileInFFmpeg,
					metadata: probeResult
				}
			};
		} catch (err) {
			phase = { type: 'configuring' };
			throw err;
		}
	}
</script>

<Dialog bind:visible title="Export">
	{#if phase.type === 'configuring'}
		<ContentSettings clipDurationInSeconds={clipDuration} trackCount={activeTracks.length} />
	{:else if phase.type === 'exporting'}
		<ContentProgress progress={0} />
	{:else}
		<ContentSuccess {...phase.result} />
	{/if}

	{#snippet actions()}
		{#if phase.type === 'configuring'}
			<ElevatedButton color="secondary" onclick={exportClip}>Export</ElevatedButton>
		{:else if phase.type === 'success'}
			<a href={phase.result.outputBlobUrl} download={phase.result.outputFileName}>
				<ElevatedButton buttonProps={{ tabindex: -1 }}>Download</ElevatedButton>
			</a>
		{/if}
	{/snippet}
</Dialog>
