<script lang="ts">
	import { convertGlobalToRangeSpace, type RangeInterval } from './interval-space';

	interface Props {
		playingHeadPosition: number;
		visibleRange: RangeInterval;
		markingRange: RangeInterval;
	}

	let { playingHeadPosition, visibleRange, markingRange }: Props = $props();

	let positionInView = $derived(convertGlobalToRangeSpace(playingHeadPosition, visibleRange));
	let markingRangeInView = $derived<RangeInterval>({
		start: convertGlobalToRangeSpace(markingRange.start, visibleRange),
		end: convertGlobalToRangeSpace(markingRange.end, visibleRange)
	});

	let clientWidth = $state(0);
	let clientHeight = $state(0);
</script>

<div class="wrapper" bind:clientWidth bind:clientHeight>
	<div class="playing-head" style="--x: {positionInView * clientWidth}px;"></div>

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
			transform: translateX(var(--x));
		}
	}

	.playing-head {
		width: 1px;
		background-color: white;
	}

	.boundary {
		width: 100%;
		backdrop-filter: grayscale(1) brightness(50%);

		&.start {
			right: 100%;
			border-right: 1px solid scheme.var-color('text');
		}

		&.end {
			left: 0;
			border-left: 1px solid scheme.var-color('text');
		}
	}
</style>
