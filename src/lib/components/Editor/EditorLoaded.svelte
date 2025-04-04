<script lang="ts">
	import { untrack } from 'svelte';
	import Audio from './Audio.svelte';
	import ControlArea from './ControlArea.svelte';
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
	let loop = $state(true);
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
		const markingRangeEnd = untrack(() => markingRange.end);
		if (markingRangeStart > 0 || markingRangeEnd < 1) {
			// Update cursor whenever changing the clip marking range
			playheadPosition = markingRangeStart;
		}
	});

	$effect.pre(() => {
		const isCursorAfterClip = playheadPosition >= markingRange.end;
		const isMediaPlayheadAfterClip = mediaPlayheadPosition >= markingRange.end;

		if (!isCursorAfterClip && isMediaPlayheadAfterClip) {
			if (loop) {
				controlledTime = [markingRange.start * videoDuration];
			} else {
				paused = true;
				controlledTime = [playheadPosition * videoDuration];
			}
		}
	});

	function snapToStart() {
		paused = true;
		playheadPosition = markingRangeStart;
		controlledTime = [markingRangeStart * videoDuration];
	}

	function handleKeyDown(ev: KeyboardEvent) {
		const focused = ev.target;
		if (focused instanceof HTMLInputElement) {
			return;
		}

		const isAnyElementFocused =
			focused && focused !== document.body && focused !== document.documentElement;

		// Only handle accessibility-interfering hotkeys when no element is focused
		if (!isAnyElementFocused) {
			if (ev.key === ' ') {
				paused = !paused;
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div>
	<VideoArea {file} {paused} bind:currentTime={videoCurrentTime} bind:duration={videoDuration} />

	<ControlArea
		{snapToStart}
		bind:paused
		bind:loop
		currentTime={videoCurrentTime}
		duration={videoDuration}
	/>

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

<style lang="scss">
	div {
		display: grid;
		grid-template-rows: 1fr auto;
		gap: 16px;
	}
</style>
