<script lang="ts">
	import { useFFmpeg } from '$lib/ffmpeg/FFmpegProvider.svelte';
	import ElevatedButton from '../ElevatedButton.svelte';
	import Dialog from '../Overlay/Dialog.svelte';
	import Setting from '../Setting.svelte';
	import Duration from './TimelineArea/Duration.svelte';
	import type { RangeInterval } from './TimelineArea/interval-space';
	import type { TrackState } from './TimelineArea/TimelineArea.svelte';

	interface Props {
		visible: boolean;

		file: File;
		tracks: TrackState[];
		markingRange: RangeInterval;
		videoDuration: number;
	}

	let { visible = $bindable(), file, tracks, markingRange, videoDuration }: Props = $props();

	const { ffmpeg } = useFFmpeg();

	let isTrimmingActive = $derived(markingRange.start > 0 || markingRange.end < 1);

	async function exportClip() {
		const doPreciseTrimming = true;

		const { outputFileInFFmpeg } = await $ffmpeg!.convert(file, {
			includeVideo: false,
			audio: {
				streamIds: [],
				singleOutputStream: true
			},
			trimming: isTrimmingActive
				? {
						highPrecision: doPreciseTrimming,
						start: markingRange.start * videoDuration,
						end: markingRange.end * videoDuration
					}
				: undefined
		});

		console.log('done');

		const probeResult = await $ffmpeg!.probe(outputFileInFFmpeg);
		console.log(probeResult);
	}

	let clipDuration = $derived((markingRange.end - markingRange.start) * videoDuration);
	let activeTracks = $derived(tracks.filter((track) => track.isUsed));
</script>

<Dialog bind:visible title="Export">
	<div class="content">
		<div class="info">
			Export a <em><Duration seconds={clipDuration} /></em> long clip of your video with
			<em>
				{#if activeTracks.length === 1}
					1 audio track
				{:else}
					{activeTracks.length} audio tracks
				{/if}
			</em>.
		</div>

		<Setting headline="Format">
			Select the output format.

			{#snippet trailing()}
				Opus
			{/snippet}
		</Setting>

		{#if activeTracks.length >= 2}
			<Setting headline="Single Audio Track">
				If enabled, the {activeTracks.length} audio tracks will be mixed into one.

				{#snippet trailing()}
					<input type="checkbox" checked />
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
</style>
