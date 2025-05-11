<script lang="ts">
	import Tooltip from '$lib/components/Overlay/Tooltip.svelte';
	import InteractiveTimelineBar, { timelineA11y } from './InteractiveTimelineBar.svelte';
	import {
		constrainRangeInterval,
		convertGlobalToRangeSpace,
		type RangeInterval
	} from './interval-space';
	import Timecode from './Timecode.svelte';

	interface Props {
		playhead: number;
		mediaPlayhead: number;
		markingRange: RangeInterval;
		visibleRange: RangeInterval;
		duration: number;
	}

	let {
		playhead,
		mediaPlayhead,
		markingRange = $bindable(),
		visibleRange,
		duration
	}: Props = $props();

	let playheadInView = $derived(convertGlobalToRangeSpace(playhead, visibleRange));
	let mediaPlayheadInView = $derived(convertGlobalToRangeSpace(mediaPlayhead, visibleRange));

	let markingRangeInView = $derived<RangeInterval>({
		start: convertGlobalToRangeSpace(markingRange.start, visibleRange),
		end: convertGlobalToRangeSpace(markingRange.end, visibleRange)
	});

	let isTrimmingActive = $derived(markingRange.start > 0 || markingRange.end < 1);

	type Draggable = 'start' | 'end';
	let dragging = $state<Draggable>();

	function onDrag(delta: number) {
		if (dragging === 'start') {
			const newRangeStart = markingRange.start + delta;

			if (newRangeStart <= markingRange.end) {
				markingRange.start = newRangeStart;
			} else {
				// Switch to dragging the end handle
				markingRange.start = markingRange.end;
				dragging = 'end';
			}
		} else if (dragging === 'end') {
			const newRangeEnd = markingRange.end + delta;

			if (newRangeEnd >= markingRange.start) {
				markingRange.end = newRangeEnd;
			} else {
				// Switch to dragging the start handle
				markingRange.end = markingRange.start;
				dragging = 'start';
			}
		}

		markingRange = constrainRangeInterval(markingRange);
	}

	function onBarInteract(ev: MouseEvent, mouseInInterval: number) {
		if (ev.buttons === 1) {
			// Start trimming from this position
			markingRange = { start: mouseInInterval, end: mouseInInterval };
			dragging = 'end';
		}
	}

	function onBarDoubleClick() {
		if (markingRange.start === markingRange.end) {
			// Reset trim range
			markingRange = { start: 0, end: 1 };
		}
	}
</script>

<InteractiveTimelineBar
	bind:dragging
	{visibleRange}
	{onBarInteract}
	{onBarDoubleClick}
	{onDrag}
	cursor="text"
>
	{#snippet children(clientWidth, eventStartDragging)}
		<div class="playhead" style="--x: {mediaPlayheadInView * clientWidth}px;"></div>
		<div class="playhead cursor" style="--x: {playheadInView * clientWidth}px;"></div>

		{#if isTrimmingActive}
			{@const start = markingRangeInView.start}
			{@const end = markingRangeInView.end}
			<Tooltip keepVisible={dragging === 'start'}>
				<div
					class="handle start"
					class:dragging={dragging === 'start'}
					style="--x: {start * clientWidth}px;"
					use:timelineA11y={() => ({
						value: markingRange.start,
						mediaDuration: duration,
						onmousedown: eventStartDragging('start')
					})}
				></div>

				{#snippet title()}
					<Timecode seconds={markingRange.start * duration} />
				{/snippet}
			</Tooltip>

			<div
				class="clip"
				style="--start: {start * clientWidth}px; --end: {end * clientWidth}px;"
			></div>

			<Tooltip keepVisible={dragging === 'end'}>
				<div
					class="handle end"
					class:dragging={dragging === 'end'}
					style="--x: {end * clientWidth}px;"
					use:timelineA11y={() => ({
						value: markingRange.end,
						mediaDuration: duration,
						onmousedown: eventStartDragging('end')
					})}
				></div>

				{#snippet title()}
					<Timecode seconds={markingRange.end * duration} />
				{/snippet}
			</Tooltip>
		{/if}
	{/snippet}
</InteractiveTimelineBar>

<style lang="scss">
	@use '$lib/style/scheme';

	$handle-width: 24px;
	$handle-interaction-padding: 20px;

	.playhead {
		position: absolute;
		height: 100%;
		width: 1px;
		pointer-events: none;

		border-radius: 0 0 100vw 100vw;
		transform: translateX(var(--x));
		background-color: scheme.var-color('primary');
	}

	.cursor {
		background-color: white;
	}

	.handle {
		position: absolute;
		height: 100%;
		width: $handle-width;

		background-color: scheme.var-color('secondary');
		transform: translateX(var(--x));

		&:hover {
			background-color: scheme.var-color('secondary', 1);
		}

		&.dragging {
			background-color: scheme.var-color('secondary', 2);
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
