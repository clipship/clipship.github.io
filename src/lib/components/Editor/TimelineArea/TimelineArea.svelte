<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import {
		constrainCenteredInterval,
		convertCenteredToRangeInterval,
		modifyIntervalZoomWithPivot,
		type CenteredInterval,
		type RangeInterval
	} from './interval-space';
	import Timecode from './Timecode.svelte';
	import TimelineMarkingBar from './TimelineMarkingBar.svelte';
	import TimelineMarkingOverlay from './TimelineMarkingOverlay.svelte';
	import TimelinePlayheadBar from './TimelinePlayheadBar.svelte';
	import TrackChannel from './TrackChannel.svelte';
	import TrackTimeline from './TrackTimeline.svelte';

	const MAX_WHEEL_DELTA = 3;
	const ZOOM_AMOUNT = 0.2;
	const ZOOM_TWEEN_DURATION_MS = 200;

	const INITIAL_CENTERED_INTERVAL: CenteredInterval = {
		center: 0.5,
		rangeFromCenter: 0.5
	};

	const BITMASK_LEFT_MOUSE_BUTTON = 0b1;
	const BITMASK_MIDDLE_MOUSE_BUTTON = 0b100;

	export interface TrackState {
		isUsed: boolean;
		wavBuffer?: ArrayBuffer;
	}

	interface Props {
		tracks: TrackState[];
		duration: number;
		mediaPlayheadPosition: number;
		playheadPosition: number;
		markingRange: RangeInterval;
	}

	let {
		tracks = $bindable(),
		duration,
		mediaPlayheadPosition,
		playheadPosition = $bindable(),
		markingRange = $bindable()
	}: Props = $props();

	let transform = $state<CenteredInterval>(INITIAL_CENTERED_INTERVAL);
	let transformAsRange = new Tween(convertCenteredToRangeInterval(INITIAL_CENTERED_INTERVAL), {
		duration: ZOOM_TWEEN_DURATION_MS,
		easing: cubicOut
	});

	$effect(() => {
		transformAsRange.set(convertCenteredToRangeInterval(transform));
	});

	let timelineElement = $state<HTMLElement>();
	let timelineWidth = $state(0);
	let timelineBoundingRect = $state<DOMRect>();

	$effect(() => {
		if (timelineElement && timelineWidth) {
			timelineBoundingRect = timelineElement.getBoundingClientRect();
		}
	});

	function modifyZoom(delta: number, pivotInView: number) {
		transform = modifyIntervalZoomWithPivot(transform, delta * ZOOM_AMOUNT, pivotInView);
	}

	function handleWheel(ev: WheelEvent) {
		const delta = ev.deltaY;
		const amount = Math.min(Math.abs(delta), MAX_WHEEL_DELTA) / MAX_WHEEL_DELTA;

		const pivot = (ev.clientX - timelineBoundingRect!.x) / timelineWidth;

		modifyZoom(Math.sign(delta) * amount, pivot);
	}

	function processplayheadDragging(ev: MouseEvent) {
		if ((ev.buttons & BITMASK_LEFT_MOUSE_BUTTON) > 0) {
			const { start, end } = transformAsRange.current;

			const mouseInViewFraction = (ev.clientX - timelineBoundingRect!.x) / timelineWidth;
			const mouseInInterval = start + mouseInViewFraction * (end - start);

			playheadPosition = mouseInInterval;
		}
	}

	function handlePanning(ev: MouseEvent) {
		if ((ev.buttons & BITMASK_MIDDLE_MOUSE_BUTTON) > 0) {
			const deltaFractionUnscaled = (-2 * ev.movementX) / timelineWidth;

			const delta = transform.rangeFromCenter * deltaFractionUnscaled;

			transform = constrainCenteredInterval({
				center: transform.center + delta,
				rangeFromCenter: transform.rangeFromCenter
			});
		}
	}
</script>

<div class="wrapper" onmousemove={handlePanning} onwheel={handleWheel} role="presentation">
	<div class="marking-bar">
		<div class="placeholder-cell">
			<Timecode seconds={mediaPlayheadPosition * duration} />
		</div>
		<TimelinePlayheadBar
			visibleRange={transformAsRange.current}
			bind:playhead={playheadPosition}
			mediaPlayhead={mediaPlayheadPosition}
		/>
	</div>

	<div class="timeline-area">
		<div class="channels">
			{#each tracks as track, i}
				<div class="track">
					<TrackChannel
						bind:isUsed={track.isUsed}
						audioBuffer={track.wavBuffer}
						name={'Track ' + (i + 1)}
					/>
				</div>
			{/each}
		</div>

		<div
			class="timeline"
			bind:clientWidth={timelineWidth}
			bind:this={timelineElement}
			onmousedown={processplayheadDragging}
			onmousemove={processplayheadDragging}
			role="presentation"
		>
			<TimelineMarkingOverlay
				visibleRange={transformAsRange.current}
				{mediaPlayheadPosition}
				{playheadPosition}
				{markingRange}
			/>

			{#each tracks as track}
				<div class="track">
					<TrackTimeline range={transformAsRange.current} wavBuffer={track.wavBuffer} />
				</div>
			{/each}
		</div>
	</div>

	<div class="marking-bar">
		<div class="placeholder-cell"></div>
		<TimelineMarkingBar visibleRange={transformAsRange.current} bind:markingRange />
	</div>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	$channel-width: 120px;

	.marking-bar,
	.timeline-area {
		display: grid;
		grid-template-columns: $channel-width 1fr;
	}

	.marking-bar {
		border: 1px solid scheme.var-color('primary');
	}

	.placeholder-cell {
		border-right: 1px solid scheme.var-color('primary', -1);
		text-align: center;
	}

	.timeline-area {
		border: 1px solid scheme.var-color('primary');
		border-top: none;
		border-bottom: none;
	}

	.channels {
		border-right: 1px solid scheme.var-color('primary', -1);
	}

	.timeline {
		position: relative;
		background-color: scheme.var-color('primary', -2);
	}

	.track {
		height: 120px;
		display: grid;

		&:not(:first-child) {
			border-top: 1px solid scheme.var-color('primary', -1);
		}
	}
</style>
