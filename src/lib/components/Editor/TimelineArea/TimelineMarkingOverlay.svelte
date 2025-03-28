<script lang="ts">
	import { convertGlobalToRangeSpace, type RangeInterval } from './interval-space';

	interface Props {
		mediaPlayheadPosition: number;
		playheadPosition: number;
		visibleRange: RangeInterval;
		markingRange: RangeInterval;
	}

	let { mediaPlayheadPosition, playheadPosition, visibleRange, markingRange }: Props = $props();

	let mediaPositionInView = $derived(
		convertGlobalToRangeSpace(mediaPlayheadPosition, visibleRange)
	);

	let positionInView = $derived(convertGlobalToRangeSpace(playheadPosition, visibleRange));
	let markingRangeInView = $derived<RangeInterval>({
		start: convertGlobalToRangeSpace(markingRange.start, visibleRange),
		end: convertGlobalToRangeSpace(markingRange.end, visibleRange)
	});

	let clientWidth = $state(0);
	let clientHeight = $state(0);
</script>

<div class="wrapper" bind:clientWidth bind:clientHeight>
	<div class="playhead media" style="--x: {mediaPositionInView * clientWidth}px;"></div>
	<div class="playhead" style="--x: {positionInView * clientWidth}px;"></div>

	<div class="boundary start" style="--x: {markingRangeInView.start * clientWidth}px;"></div>
	<div class="boundary end" style="--x: {markingRangeInView.end * clientWidth}px;"></div>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	.wrapper {
		z-index: 1;
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;

		overflow: hidden;
		pointer-events: none;

		> * {
			position: absolute;
			height: 100%;
		}
	}

	.playhead {
		width: 1px;
		background-color: white;
		transform: translateX(var(--x));

		&.media {
			background-color: scheme.var-color('primary', 0);
		}
	}

	.boundary {
		backdrop-filter: grayscale(1) brightness(50%);

		&.start {
			left: -1.5px;
			width: calc(var(--x));
			border-right: 1px solid scheme.var-color('secondary', 1);
		}

		&.end {
			left: calc(var(--x) - 0.5px);
			right: 0;
			border-left: 1px solid scheme.var-color('secondary', 1);
		}
	}
</style>
