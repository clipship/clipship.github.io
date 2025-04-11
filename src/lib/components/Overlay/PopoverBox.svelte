<script lang="ts" generics="TProps">
	import { onMount, type Snippet } from 'svelte';

	const VIEWPORT_MARGIN = 0;

	interface Props {
		reference: HTMLElement;
		popover: Snippet;

		readonly renderedText?: string;
	}

	let { reference, popover, renderedText = $bindable() }: Props = $props();

	let rect = $state(reference.getBoundingClientRect());

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

	let child = $state<HTMLElement>();
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

	// Update renderedText whenever the content of the popover changes
	onMount(() => {
		renderedText = child!.innerText;

		const observer = new MutationObserver(() => {
			renderedText = child!.innerText;
		});

		observer.observe(child!, { characterData: true, childList: true, subtree: true });

		return () => {
			observer.disconnect();
		};
	});
</script>

<svelte:window
	onresize={() => {
		documentWidth = document.body.clientWidth;
		documentHeight = document.body.clientHeight;
	}}
/>

<div
	bind:this={child}
	class="child"
	bind:clientWidth={childWidth}
	bind:clientHeight={childHeight}
	style="--x: {childX}px; --y: {childY}px;"
>
	{@render popover()}
</div>

<style lang="scss">
	.child {
		position: absolute;
		left: var(--x);
		top: var(--y);
		display: inline-flex;
	}
</style>
