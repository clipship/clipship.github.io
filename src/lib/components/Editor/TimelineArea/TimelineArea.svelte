<script lang="ts">
	import TrackChannel from './TrackChannel.svelte';
	import TrackTimeline from './TrackTimeline.svelte';

	export interface TrackState {
		isUsed: boolean;
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
				<TrackTimeline />
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	.timeline-area {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 4px;
		border: 1px solid scheme.var-color('primary');
	}

	.timeline {
		background-color: grey;
	}

	.track {
		height: 80px;
		display: grid;
	}
</style>
