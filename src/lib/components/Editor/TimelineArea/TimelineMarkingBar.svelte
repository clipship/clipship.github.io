<script lang="ts">
	import InteractiveTimelineBar, { timelineA11y } from './InteractiveTimelineBar.svelte';
	import {
		constrainRangeInterval,
		convertGlobalToRangeSpace,
		type RangeInterval
	} from './interval-space';

	interface Props {
		markingRange: RangeInterval;
		visibleRange: RangeInterval;
	}

	let { markingRange = $bindable(), visibleRange }: Props = $props();

	let markingRangeInView = $derived<RangeInterval>({
		start: convertGlobalToRangeSpace(markingRange.start, visibleRange),
		end: convertGlobalToRangeSpace(markingRange.end, visibleRange)
	});

	type Draggable = 'start' | 'end';

	let dragging = $state<Draggable>();

	function onDrag(mouseInInterval: number) {
		if (dragging === 'start') {
			markingRange.start = Math.min(mouseInInterval, markingRange.end);
		} else if (dragging === 'end') {
			markingRange.end = Math.max(markingRange.start, mouseInInterval);
		}

		markingRange = constrainRangeInterval(markingRange);
	}

	function onBarInteract(ev: MouseEvent, mouseInInterval: number) {
		if (ev.buttons === 1) {
			markingRange = { start: mouseInInterval, end: mouseInInterval };
			dragging = 'end';
		}
	}
</script>

<InteractiveTimelineBar bind:dragging {visibleRange} {onBarInteract} {onDrag} cursor="copy">
	{#snippet children(clientWidth, eventStartDragging)}
		<div
			class="handle start"
			class:dragging={dragging === 'start'}
			style="--x: {markingRangeInView.start * clientWidth}px;"
			use:timelineA11y={{
				value: markingRange.start,
				onmousedown: eventStartDragging('start')
			}}
		></div>
		<div
			class="handle end"
			class:dragging={dragging === 'end'}
			style="--x: {markingRangeInView.end * clientWidth}px;"
			use:timelineA11y={{
				value: markingRange.end,
				onmousedown: eventStartDragging('end')
			}}
		></div>
	{/snippet}
</InteractiveTimelineBar>

<style lang="scss">
	@use '$lib/style/scheme';

	$handle-width: 20px;
	$handle-interaction-padding: 20px;

	.handle {
		position: absolute;
		height: 100%;
		width: $handle-width;

		background-color: scheme.var-color('secondary');
		transform: translateX(var(--x));

		&:hover,
		&.dragging {
			background-color: scheme.var-color('secondary', 1);
		}

		&.start {
			left: calc(-1.5px - $handle-width);
			border-radius: 100vw 0 0 100vw;
			cursor: w-resize;
		}

		&.end {
			border-radius: 0 100vw 100vw 0;
			cursor: e-resize;
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: -$handle-interaction-padding;
			right: -$handle-interaction-padding;
		}
	}
</style>
