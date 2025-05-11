<script lang="ts">
	import { useFFmpeg } from '$lib/ffmpeg/FFmpegProvider.svelte';
	import TextButton from '../BarButton.svelte';
	import Checkbox from '../Checkbox.svelte';
	import Dropdown from '../Dropdown.svelte';
	import ElevatedButton from '../ElevatedButton.svelte';
	import Dialog from '../Overlay/Dialog.svelte';
	import Setting from '../Setting.svelte';
	import { AudioFormats, VideoFormats } from './formats';
	import { editorPreferences, type VideoExportMode } from './preferences.svelte';
	import Duration from './TimelineArea/Duration.svelte';
	import type { RangeInterval } from './TimelineArea/interval-space';
	import type { TrackState } from './TimelineArea/TimelineArea.svelte';

	const VIDEO_EXPORT_MODES: VideoExportMode[] = ['fast', 're-encode'];

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

	const settings = editorPreferences.export;

	const { ffmpeg } = useFFmpeg();

	async function exportClip() {
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

		console.log('done');

		const probeResult = await $ffmpeg!.probe(outputFileInFFmpeg);
		console.log(probeResult);
	}
</script>

<Dialog bind:visible title="Export">
	<div class="content">
		<div class="info">
			Export a <em><Duration seconds={clipDuration} /></em> long clip of your video with
			<em>
				<!-- TODO: Replace with actual i18n -->
				{#if activeTracks.length === 1}
					1 audio track
				{:else}
					{activeTracks.length} audio tracks
				{/if}
			</em>.
		</div>

		<div class="button-bar">
			<TextButton onclick={() => (settings.includeVideo = false)} active={!settings.includeVideo}
				>Audio</TextButton
			>
			<TextButton onclick={() => (settings.includeVideo = true)} active={settings.includeVideo}
				>Video</TextButton
			>
		</div>

		{#if !settings.includeVideo}
			<Setting headline="Format">
				Select the output format.

				{#snippet trailing()}
					<Dropdown options={Object.keys(AudioFormats)} bind:value={settings.audioFormat} />
				{/snippet}
			</Setting>
		{:else}
			<Setting headline="Video Export Mode">
				Select the processing method.

				{#snippet trailing()}
					<Dropdown options={VIDEO_EXPORT_MODES} bind:value={settings.videoExportMode} />
				{/snippet}
			</Setting>

			<Setting headline="Format" disabled={settings.videoExportMode !== 're-encode'}>
				Select the output format.

				{#snippet trailing()}
					<Dropdown options={Object.keys(VideoFormats)} bind:value={settings.videoFormat} />
				{/snippet}
			</Setting>
		{/if}

		{#if activeTracks.length >= 2}
			<Setting headline="Single Audio Track">
				If enabled, the {activeTracks.length} audio tracks will be mixed into one.

				{#snippet trailing()}
					<Checkbox bind:checked={settings.singleAudioOutputStream} />
				{/snippet}
			</Setting>
		{/if}
	</div>

	{#snippet actions()}
		<ElevatedButton color="secondary" onclick={exportClip}>Export</ElevatedButton>
	{/snippet}
</Dialog>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.button-bar {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		padding: 0 64px;
		align-items: stretch;
	}
</style>
