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

	let isTrimmingActive = $derived(markingRange.start > 0 || markingRange.end < 1);

	type Draggable = 'start' | 'end';
	let dragging = $state<Draggable>();

	function onDrag(delta: number) {
		if (dragging === 'start') {
			markingRange.start = Math.min(markingRange.start + delta, markingRange.end);
		} else if (dragging === 'end') {
			markingRange.end = Math.max(markingRange.start, markingRange.end + delta);
		}

		markingRange = constrainRangeInterval(markingRange);
	}

	function onBarInteract(ev: MouseEvent, mouseInInterval: number) {
		if (ev.buttons === 1) {
			if (!isTrimmingActive) {
				// Start trimming from this position
				markingRange = { start: mouseInInterval, end: mouseInInterval };
				dragging = 'end';
			} else {
				// Stop trimming
				markingRange = { start: 0, end: 1 };
			}
		}
	}
</script>

<InteractiveTimelineBar
	bind:dragging
	{visibleRange}
	{onBarInteract}
	{onDrag}
	cursor={isTrimmingActive ? 'pointer' : 'copy'}
>
	{#snippet children(clientWidth, eventStartDragging)}
		{#if isTrimmingActive}
			{@const start = markingRangeInView.start}
			{@const end = markingRangeInView.end}
			<div
				class="handle start"
				class:dragging={dragging === 'start'}
				style="--x: {start * clientWidth}px;"
				use:timelineA11y={{
					value: markingRange.start,
					onmousedown: eventStartDragging('start')
				}}
			></div>

			<div
				class="clip"
				style="--start: {start * clientWidth}px; --end: {end * clientWidth}px;"
			></div>

			<div
				class="handle end"
				class:dragging={dragging === 'end'}
				style="--x: {end * clientWidth}px;"
				use:timelineA11y={{
					value: markingRange.end,
					onmousedown: eventStartDragging('end')
				}}
			></div>
		{/if}
	{/snippet}
</InteractiveTimelineBar>

<style lang="scss">
	@use '$lib/style/scheme';

	$handle-width: 24px;
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
			left: calc(-0.5px - $handle-width);
			border-radius: 100vw 0 0 100vw;
			border-right: 1px solid scheme.var-color('secondary', 1);
			cursor: w-resize;
		}

		&.end {
			border-radius: 0 100vw 100vw 0;
			border-left: 1px solid scheme.var-color('secondary', 1);
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

	.clip {
		position: absolute;
		z-index: -1;
		height: 100%;
		width: calc(var(--end) - var(--start));
		transform: translateX(var(--start));
		background-color: scheme.var-color('secondary', -2);
	}
</style>
