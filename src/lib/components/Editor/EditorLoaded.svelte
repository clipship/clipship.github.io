<script lang="ts">
	import Audio from './Audio.svelte';
	import type { RangeInterval } from './TimelineArea/interval-space';
	import type { TrackState } from './TimelineArea/TimelineArea.svelte';
	import TimelineArea from './TimelineArea/TimelineArea.svelte';
	import VideoArea from './VideoArea.svelte';

	interface Props {
		file: File;
		tracks: TrackState[];
	}

	let { file, tracks = $bindable() }: Props = $props();

	let playheadPosition = $state(0);
	let markingRange = $state<RangeInterval>({ start: 0, end: 1 });
	let markingRangeStart = $derived(markingRange.start);

	// Using $state.raw (with an array) makes all value changes reactive.
	// This allows dependent $effects to trigger even if the same value gets assigned twice.
	// Here, this is used for retriggering $effects whenever the clip should loop.
	let controlledTime = $state.raw([0]);

	let paused = $state(true);
	let videoCurrentTime = $state(0);
	let videoDuration = $state(1);
	let mediaPlayheadPosition = $derived(videoCurrentTime / videoDuration);

	$effect(() => {
		// Manually set video time when controlledCurrentTime changes
		videoCurrentTime = controlledTime[0];
	});

	$effect(() => {
		// Update video/media time when cursor gets moved via timeline interaction
		controlledTime = [playheadPosition * videoDuration];
	});

	$effect(() => {
		// Update cursor whenever changing the clip marking range
		playheadPosition = markingRangeStart;
	});

	$effect.pre(() => {
		const isCursorAfterClip = playheadPosition >= markingRange.end;
		const isMediaPlayheadAfterClip = mediaPlayheadPosition >= markingRange.end;

		if (!isCursorAfterClip && isMediaPlayheadAfterClip) {
			// Loop
			controlledTime = [markingRange.start * videoDuration];
		}
	});

	function handleKeyDown(ev: KeyboardEvent) {
		if (ev.key === ' ') {
			paused = !paused;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div>
	<VideoArea {file} {paused} bind:currentTime={videoCurrentTime} bind:duration={videoDuration} />

	{#each tracks as track}
		{#if track.wavBuffer}
			<Audio
				wavBuffer={track.wavBuffer}
				muted={!track.isUsed}
				{paused}
				referenceTime={controlledTime[0]}
			/>
		{/if}
	{/each}

	{#if tracks.length > 0}
		<TimelineArea
			duration={videoDuration}
			{mediaPlayheadPosition}
			bind:playheadPosition
			bind:markingRange
			bind:tracks
		/>
	{/if}
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		display: grid;
		grid-template-rows: 1fr auto;
		gap: 16px;
	}
</style>
