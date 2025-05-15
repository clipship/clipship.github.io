<script lang="ts">
	import { untrack } from 'svelte';
	import DropZone from '../DropZone.svelte';
	import Audio from './Audio.svelte';
	import ControlArea from './ControlArea.svelte';
	import ExportDialog from './ExportDialog/ExportDialog.svelte';
	import type { RangeInterval } from './TimelineArea/interval-space';
	import type { TrackState } from './TimelineArea/TimelineArea.svelte';
	import TimelineArea from './TimelineArea/TimelineArea.svelte';
	import VideoArea from './VideoArea.svelte';

	interface Props {
		file: File;
		tracks: TrackState[];
	}

	let { file = $bindable(), tracks = $bindable() }: Props = $props();

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

				if (markingRange.end >= 1) {
					paused = false;
				}
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

	function onOpenFile(newFile: File) {
		paused = true;
		playheadPosition = 0;
		markingRange = { start: 0, end: 1 };

		file = newFile;
	}

	let isExportDialogVisible = $state(false);

	function exportClip() {
		paused = true;
		isExportDialogVisible = true;
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
	<VideoArea
		{file}
		unpauseOnEnd={loop}
		{paused}
		bind:currentTime={videoCurrentTime}
		bind:duration={videoDuration}
	/>

	<ControlArea
		{snapToStart}
		bind:paused
		bind:loop
		currentTime={videoCurrentTime}
		duration={videoDuration}
		{onOpenFile}
		{exportClip}
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

<DropZone onDrop={(files) => onOpenFile(files[0])} />

<ExportDialog bind:visible={isExportDialogVisible} {file} {tracks} {markingRange} {videoDuration} />

{#each tracks as track, index (index)}
	{#if track.wavBuffer}
		<Audio
			wavBuffer={track.wavBuffer}
			volume={track.volume}
			muted={!track.isUsed}
			{paused}
			unpauseOnEnd={loop}
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
