<script lang="ts" module>
	import { type Component, type Snippet } from 'svelte';
	import { writable } from 'svelte/store';
	import PopoverBox from './PopoverBox.svelte';

	export interface Popover {
		anchorElement: HTMLElement;
		component: Component<{ visible: boolean; children: Snippet }>;
		content: Snippet;
	}

	export interface OverlayContext {
		mountPopover(popover: Popover): void;
		unmountPopover(popover: Popover): void;
	}

	const globalPopovers = writable<Popover[]>([]);

	export const globalOverlay: OverlayContext = {
		mountPopover: (popover) => globalPopovers.update((items) => [...items, popover]),

		unmountPopover: (popover) =>
			globalPopovers.update((items) => items.filter((item) => item !== popover))
	};
</script>

<div class="overlay">
	{#each $globalPopovers as popover}
		{@const Popover = popover.component}
		{@const content = popover.content}
		{@const reference = popover.anchorElement.children.item(0) as HTMLElement}

		<PopoverBox {reference}>
			{#snippet popover(visible)}
				<Popover {visible}>
					{@render content()}
				</Popover>
			{/snippet}
		</PopoverBox>
	{/each}
</div>

<style lang="scss">
	.overlay {
		position: absolute;
		z-index: 1;
		pointer-events: none;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
