<script lang="ts">
	import {
		constrainRangeInterval,
		convertGlobalToRangeSpace,
		convertRangeToGlobalSpace,
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

	let wrapper = $state<HTMLElement>();
	let boundingRect = $state<DOMRect>();
	let clientWidth = $state(0);
	let clientHeight = $state(0);

	type Draggable = 'start' | 'end';

	let dragging = $state<Draggable>();

	function updateBoundingClientRect() {
		if (!wrapper) throw new Error('Wrapper element is unbound');

		boundingRect = wrapper.getBoundingClientRect();
	}

	function eventStartDragging(draggable: Draggable) {
		return (ev: MouseEvent) => {
			ev.preventDefault();

			updateBoundingClientRect();
			dragging = draggable;
		};
	}

	function convertEventToMouseInInterval(ev: MouseEvent) {
		if (!boundingRect) throw new Error('Bounding rect is not yet determined');

		const mouseX = ev.clientX - boundingRect.left;
		const mouseInViewFraction = Math.min(Math.max(mouseX / boundingRect.width, 0), 1);

		return convertRangeToGlobalSpace(mouseInViewFraction, visibleRange);
	}

	function handleDragging(ev: MouseEvent) {
		const mouseInInterval = convertEventToMouseInInterval(ev);

		if (dragging === 'start') {
			markingRange.start = Math.min(mouseInInterval, markingRange.end);
		} else if (dragging === 'end') {
			markingRange.end = Math.max(markingRange.start, mouseInInterval);
		}

		markingRange = constrainRangeInterval(markingRange);
	}

	function onBarMouseDown(ev: MouseEvent) {
		ev.preventDefault();

		if (ev.target === wrapper) {
			updateBoundingClientRect();

			const mouseInInterval = convertEventToMouseInInterval(ev);
			markingRange = { start: mouseInInterval, end: mouseInInterval };
			dragging = 'end';
		}
	}
</script>

<svelte:window
	on:mousemove={dragging ? handleDragging : undefined}
	on:mouseup={() => (dragging = undefined)}
/>

<div
	class="wrapper"
	bind:this={wrapper}
	bind:clientWidth
	bind:clientHeight
	role="presentation"
	onmousedown={onBarMouseDown}
>
	{#if markingRangeInView}
		<div
			class="marking start"
			class:dragging={dragging === 'start'}
			style="--x: {markingRangeInView.start * clientWidth}px;"
			role="slider"
			tabindex="0"
			aria-valuenow={markingRangeInView.start}
			onmousedown={eventStartDragging('start')}
		></div>
		<div
			class="marking end"
			class:dragging={dragging === 'end'}
			style="--x: {markingRangeInView.end * clientWidth}px;"
			role="slider"
			tabindex="0"
			aria-valuenow={markingRangeInView.start}
			onmousedown={eventStartDragging('end')}
		></div>
	{/if}
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	$marking-width: 20px;

	.wrapper {
		position: relative;
		overflow: hidden;

		height: 20px;
		background-color: scheme.var-color('secondary', -2);

		cursor: text;
	}

	.marking {
		position: absolute;
		height: 100%;
		width: $marking-width;

		background-color: scheme.var-color('secondary', 1);
		transform: translateX(var(--x));

		&:hover,
		&.dragging {
			background-color: white;
		}

		&.start {
			left: -$marking-width;
			border-radius: 100vw 0 0 100vw;
			cursor: w-resize;
		}

		&.end {
			border-radius: 0 100vw 100vw 0;
			cursor: e-resize;
		}
	}
</style>
