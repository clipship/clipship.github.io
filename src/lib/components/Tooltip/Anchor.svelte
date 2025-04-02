<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { globalOverlay, PopoverState, type Popover } from './Overlay.svelte';
	import Tooltip from './Tooltip.svelte';

	interface Props {
		keepVisible?: boolean;
		tooltip: Snippet;

		children: Snippet;
	}

	let { keepVisible = false, tooltip, children }: Props = $props();

	let anchorElement = $state<HTMLElement>();

	interface TooltipState {
		visible: boolean;
	}

	let popoverState = $state<PopoverState<TooltipState>>();
	let hovered = $state(false);

	$effect(() => {
		if (popoverState) {
			popoverState.props!.visible = keepVisible || hovered;
		}
	});

	onMount(() => {
		const popover: Popover = {
			anchorElement: anchorElement!,
			component: Tooltip,
			content: tooltip
		};

		popoverState = globalOverlay.mountPopover<TooltipState>(popover, {
			visible: keepVisible
		});

		return () => {
			globalOverlay.unmountPopover(popover);
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="anchor"
	bind:this={anchorElement}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
>
	{@render children()}
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	.anchor {
		display: contents;
	}
</style>
