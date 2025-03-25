<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import TrackChannel from './TrackChannel.svelte';
	import TrackTimeline from './TrackTimeline.svelte';
	import {
		constrainCenteredInterval,
		convertCenteredToRangeInterval,
		type CenteredInterval
	} from './interval-space';

	const MAX_WHEEL_DELTA = 3;
	const ZOOM_AMOUNT = 0.2;
	const ZOOM_TWEEN_DURATION_MS = 300;

	const INITIAL_CENTERED_INTERVAL: CenteredInterval = {
		center: 0.5,
		rangeFromCenter: 0.5
	};

	const BITMASK_MIDDLE_MOUSE_BUTTON = 0b100;

	export interface TrackState {
		isUsed: boolean;
		wavBuffer?: ArrayBuffer;
	}

	interface Props {
		tracks: TrackState[];
	}

	let { tracks = $bindable() }: Props = $props();

	let transform = $state<CenteredInterval>(INITIAL_CENTERED_INTERVAL);
	let transformAsRange = new Tween(convertCenteredToRangeInterval(INITIAL_CENTERED_INTERVAL), {
		duration: ZOOM_TWEEN_DURATION_MS,
		easing: cubicOut
	});

	$effect(() => {
		transformAsRange.set(convertCenteredToRangeInterval(transform));
	});

	let timelineWidth = $state(0);

	function modifyZoom(delta: number) {
		let zoom = Math.log(transform.rangeFromCenter);
		zoom += delta * ZOOM_AMOUNT;

		const newRange = Math.exp(zoom);

		transform = constrainCenteredInterval({
			center: transform.center,
			rangeFromCenter: newRange
		});
	}

	function handleWheel(ev: WheelEvent) {
		const delta = ev.deltaY;
		const amount = Math.min(Math.abs(delta), MAX_WHEEL_DELTA) / MAX_WHEEL_DELTA;

		modifyZoom(Math.sign(delta) * amount);
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
	}
</script>

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
		onmousemove={handleMouseMove}
		role="presentation"
	>
		{#each tracks as track}
			<div class="track">
				<TrackTimeline range={transformAsRange.current} wavBuffer={track.wavBuffer} />
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
