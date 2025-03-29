<script lang="ts" module>
	interface Options {
		value: number;
		onmousedown?: (ev: MouseEvent) => void;
	}

	export function timelineA11y(node: HTMLElement, options: Options) {
		$effect(() => {
			node.role = 'slider';
			node.tabIndex = 0;
			node.ariaValueNow = `${options.value}`;

			if (options.onmousedown) {
				node.onmousedown = options.onmousedown;
			}

			return () => {};
		});
	}
</script>

<script lang="ts" generics="TDraggable extends string">
	import type { Snippet } from 'svelte';
	import { convertRangeToGlobalSpace, type RangeInterval } from './interval-space';

	interface Props {
		dragging: TDraggable | undefined;
		visibleRange: RangeInterval;

		onBarInteract: (ev: MouseEvent, mouseInInterval: number) => void;
		onDrag: (delta: number) => void;

		cursor?: string;
		children: Snippet<
			[clientWidth: number, eventStartDragging: (draggable: TDraggable) => (ev: MouseEvent) => void]
		>;
	}

	let {
		dragging = $bindable(),
		visibleRange,
		onBarInteract,
		onDrag,
		cursor,
		children
	}: Props = $props();

	let wrapper = $state<HTMLElement>();
	let boundingRect = $state<DOMRect>();
	let clientWidth = $state(0);

	let previousMouseInInterval = $state(0);

	function updateBoundingClientRect() {
		if (!wrapper) throw new Error('Wrapper element is unbound');

		boundingRect = wrapper.getBoundingClientRect();
	}

	function eventStartDragging(draggable: TDraggable) {
		return (ev: MouseEvent) => {
			ev.preventDefault();

			if (ev.buttons === 1) {
				updateBoundingClientRect();
				dragging = draggable;
			}
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
		onDrag(mouseInInterval - previousMouseInInterval);
		previousMouseInInterval = mouseInInterval;
	}

	function handleBarMouseDown(ev: MouseEvent) {
		ev.preventDefault();

		updateBoundingClientRect();
		const mouseInInterval = convertEventToMouseInInterval(ev);
		previousMouseInInterval = mouseInInterval;

		if (ev.target === wrapper) {
			onBarInteract(ev, mouseInInterval);
		}
	}
</script>

<svelte:window
	on:mousemove={dragging ? handleDragging : undefined}
	on:mouseup={() => (dragging = undefined)}
/>

<div
	class="wrapper"
	style={cursor ? `cursor: ${cursor};` : undefined}
	bind:this={wrapper}
	bind:clientWidth
	role="presentation"
	onmousedown={handleBarMouseDown}
>
	{@render children(clientWidth!, eventStartDragging)}
</div>

<style lang="scss">
	.wrapper {
		position: relative;
		overflow: hidden;

		height: 24px;
	}
</style>
