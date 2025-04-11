<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { globalOverlay, PopoverState } from './Overlay.svelte';
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
	let focused = $state(false);
	let show = $derived(hovered || focused);

	$effect(() => {
		if (popoverState) {
			popoverState.props!.visible = keepVisible || show;
		}
	});

	$effect(() => {
		if (popoverState?.renderedText) {
			anchorElement!.children[0].ariaLabel = popoverState.renderedText;
		}
	});

	onMount(() => {
		popoverState = globalOverlay.mountPopover<TooltipState>(
			{
				anchorElement: anchorElement!,
				component: Tooltip,
				content: tooltip
			},
			{
				visible: keepVisible
			}
		);

		return () => {
			popoverState!.unmount();
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="anchor"
	bind:this={anchorElement}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	onfocusin={() => (focused = true)}
	onfocusout={() => (focused = false)}
>
	{@render children()}
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	.anchor {
		display: contents;
	}
</style>
