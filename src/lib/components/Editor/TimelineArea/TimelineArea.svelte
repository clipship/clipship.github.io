<script lang="ts">
	import TrackChannel from './TrackChannel.svelte';
	import TrackTimeline from './TrackTimeline.svelte';

	export interface TrackState {
		isUsed: boolean;
		pcmData?: Int8Array;
	}

	interface Props {
		tracks: TrackState[];
	}

	let { tracks = $bindable() }: Props = $props();
</script>

<div class="timeline-area">
	<div class="channels">
		{#each tracks as track, i}
			<div class="track">
				<TrackChannel bind:isUsed={track.isUsed} name={'Track ' + (i + 1)} />
			</div>
		{/each}
	</div>
	<div class="timeline">
		{#each tracks as track}
			<div class="track">
				<TrackTimeline pcmData={track.pcmData} />
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	.timeline-area {
		display: grid;
		grid-template-columns: 200px 1fr;
		border: 1px solid scheme.var-color('primary');
	}

	.channels {
		border-right: 1px solid scheme.var-color('primary', -1);
	}

	.timeline {
		background-color: scheme.var-color('primary', -2);
	}

	.track {
		height: 80px;
		display: grid;

		&:not(:first-child) {
			border-top: 1px solid scheme.var-color('primary', -1);
		}
	}
</style>
