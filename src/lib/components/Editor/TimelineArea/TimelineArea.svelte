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
	import TimelineMarkingBar from './TimelineMarkingBar.svelte';
	import TimelineMarkingOverlay from './TimelineMarkingOverlay.svelte';
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
	}

	let { tracks = $bindable() }: Props = $props();

	let playingHeadPosition = $state(0);
	let markingRange = $state<RangeInterval>({ start: 0.4, end: 0.6 });

	let transform = $state<CenteredInterval>(INITIAL_CENTERED_INTERVAL);
	let transformAsRange = new Tween(convertCenteredToRangeInterval(INITIAL_CENTERED_INTERVAL), {
		duration: ZOOM_TWEEN_DURATION_MS,
		easing: cubicOut
	});

	$effect(() => {
		transformAsRange.set(convertCenteredToRangeInterval(transform));
	});

	let timelineWidth = $state(0);

	function modifyZoom(delta: number, pivotInView: number) {
		transform = modifyIntervalZoomWithPivot(transform, delta * ZOOM_AMOUNT, pivotInView);
	}

	function handleWheel(ev: WheelEvent) {
		const delta = ev.deltaY;
		const amount = Math.min(Math.abs(delta), MAX_WHEEL_DELTA) / MAX_WHEEL_DELTA;

		const pivot = ev.offsetX / timelineWidth;

		modifyZoom(Math.sign(delta) * amount, pivot);
	}

	function processLeftMouseButton(ev: MouseEvent) {
		if ((ev.buttons & BITMASK_LEFT_MOUSE_BUTTON) > 0) {
			const { start, end } = transformAsRange.current;

			const mouseInViewFraction = ev.offsetX / timelineWidth;
			const mouseInInterval = start + mouseInViewFraction * (end - start);

			playingHeadPosition = mouseInInterval;
		}
	}

	function handleMouseMove(ev: MouseEvent) {
		if ((ev.buttons & BITMASK_MIDDLE_MOUSE_BUTTON) > 0) {
			const deltaFractionUnscaled = (-2 * ev.movementX) / timelineWidth;

			const delta = transform.rangeFromCenter * deltaFractionUnscaled;

			transform = constrainCenteredInterval({
				center: transform.center + delta,
				rangeFromCenter: transform.rangeFromCenter
			});
		}

		processLeftMouseButton(ev);
	}
</script>

<div class="marking-bar">
	<div class="placeholder-cell"></div>
	<TimelineMarkingBar visibleRange={transformAsRange.current} bind:markingRange />
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
		onwheel={handleWheel}
		onmousedown={processLeftMouseButton}
		onmousemove={handleMouseMove}
		role="presentation"
	>
		<TimelineMarkingOverlay
			visibleRange={transformAsRange.current}
			{playingHeadPosition}
			{markingRange}
		/>

		{#each tracks as track}
			<div class="track">
				<TrackTimeline range={transformAsRange.current} wavBuffer={track.wavBuffer} />
			</div>
		{/each}
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
		border: 1px solid scheme.var-color('secondary');
	}

	.placeholder-cell {
		border-right: 1px solid scheme.var-color('secondary');
	}

	.timeline-area {
		border: 1px solid scheme.var-color('primary');
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
