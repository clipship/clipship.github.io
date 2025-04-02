<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	const VIEWPORT_MARGIN = 0;

	interface Props {
		reference: HTMLElement;
		keepVisible?: boolean;
		popover: Snippet<[keepVisible: boolean]>;
	}

	let { reference, popover }: Props = $props();

	let rect = $state(reference.getBoundingClientRect());
	let mockBox = $state<HTMLElement>();

	let update = $state(true);
	let animationFrameRequest = $state<number>();

	function updateRect() {
		if (!update) return;

		rect = reference.getBoundingClientRect();

		animationFrameRequest = requestAnimationFrame(updateRect);
	}

	$effect(() => {
		if (update) {
			animationFrameRequest = requestAnimationFrame(updateRect);
		} else if (animationFrameRequest !== undefined) {
			cancelAnimationFrame(animationFrameRequest);
			animationFrameRequest = undefined;
		}
	});

	onMount(() => {
		return () => {
			if (animationFrameRequest !== undefined) {
				cancelAnimationFrame(animationFrameRequest);
			}
		};
	});

	let childWidth = $state(0);
	let childHeight = $state(0);

	let documentWidth = $state(document.body.clientWidth);
	let documentHeight = $state(document.body.clientHeight);

	let maxX = $derived(documentWidth - VIEWPORT_MARGIN - childWidth);
	let maxY = $derived(documentHeight - VIEWPORT_MARGIN - childHeight);

	// Horizontally centered
	let childXUnclamped = $derived(rect.x + rect.width / 2 - childWidth / 2);
	// Vertically above top of reference element
	let childYUnclamped = $derived(rect.y - childHeight);

	let childX = $derived(Math.min(Math.max(childXUnclamped, VIEWPORT_MARGIN), maxX));
	let childY = $derived(Math.min(Math.max(childYUnclamped, VIEWPORT_MARGIN), maxY));
</script>

<svelte:window
	onresize={() => {
		documentWidth = document.body.clientWidth;
		documentHeight = document.body.clientHeight;
	}}
/>

<div
	bind:this={mockBox}
	class="box"
	style="--x: {rect.x}px; --y: {rect.y}px; --width: {rect.width}px; --height: {rect.height}px;"
></div>

<div
	class="child"
	bind:clientWidth={childWidth}
	bind:clientHeight={childHeight}
	style="--x: {childX}px; --y: {childY}px;"
>
	{@render popover(true)}
</div>

<style lang="scss">
	.box {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--width);
		height: var(--height);
		outline: 1px solid white;
	}

	.child {
		position: absolute;
		left: var(--x);
		top: var(--y);
		display: inline-flex;
	}
</style>
