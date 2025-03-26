<script lang="ts">
	import type { RangeInterval } from './TimelineArea/interval-space';
	import type { TrackState } from './TimelineArea/TimelineArea.svelte';
	import TimelineArea from './TimelineArea/TimelineArea.svelte';

	import VideoArea from './VideoArea.svelte';

	interface Props {
		file: File;
		tracks: TrackState[];
	}

	let { file, tracks = $bindable() }: Props = $props();

	let playingHeadPosition = $state(0);
	let markingRange = $state<RangeInterval>({ start: 0, end: 1 });
</script>

<div>
	<VideoArea {file} />
	{#if tracks.length > 0}
		<TimelineArea bind:playingHeadPosition bind:markingRange bind:tracks />
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
