<script lang="ts">
	import { convertGlobalToRangeSpace, type RangeInterval } from './interval-space';

	interface Props {
		markingRange?: RangeInterval;
		visibleRange: RangeInterval;
	}

	let { markingRange = $bindable(), visibleRange }: Props = $props();

	let markingRangeInView = $derived<RangeInterval | undefined>(
		markingRange
			? {
					start: convertGlobalToRangeSpace(markingRange.start, visibleRange),
					end: convertGlobalToRangeSpace(markingRange.end, visibleRange)
				}
			: undefined
	);

	let clientWidth = $state(0);
	let clientHeight = $state(0);
</script>

<div class="wrapper" bind:clientWidth bind:clientHeight>
	{#if markingRangeInView}
		<div class="marking start" style="--x: {markingRangeInView.start * clientWidth}px;"></div>
		<div class="marking end" style="--x: {markingRangeInView.end * clientWidth}px;"></div>
	{/if}
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	$marking-width: 12px;

	.wrapper {
		position: relative;
		overflow: hidden;

		height: 1.5em;
		background-color: scheme.var-color('secondary', -2);
	}

	.marking {
		position: absolute;
		height: 100%;
		width: $marking-width;

		background-color: white;
		transform: translateX(var(--x));

		&.start {
			border-radius: 0 100vw 100vw 0;
		}

		&.end {
			border-radius: 100vw 0 0 100vw;
			left: -$marking-width;
		}
	}
</style>
