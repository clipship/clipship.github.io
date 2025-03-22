<script lang="ts">
	import { browser } from '$app/environment';
	import { useFFmpeg } from '../util/FFmpegProvider.svelte';
	import TimelineArea, { type TrackState } from './TimelineArea/TimelineArea.svelte';
	import VideoArea from './VideoArea.svelte';

	const { downloadProgress, ffmpeg, startDownload } = useFFmpeg();

	let tracks = $state<TrackState[]>([{ isUsed: true }]);

	$effect(() => {
		if (browser) {
			startDownload();
		}
	});
</script>

{#if !$ffmpeg}
	<div class="loading">
		{#if $downloadProgress}
			<p>{$downloadProgress.received} / {$downloadProgress.total}</p>
		{/if}
	</div>
{:else}
	<div>
		<VideoArea />
		<TimelineArea bind:tracks />
	</div>
{/if}

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		display: grid;
		grid-template-rows: 1fr auto;

		padding: 4px;
		gap: 4px;
		border: 1px solid scheme.var-color('primary');

		&.loading {
			grid-template-rows: auto;
			place-content: center;
		}
	}
</style>
