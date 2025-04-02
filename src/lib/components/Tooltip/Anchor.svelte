<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { globalOverlay, type Popover } from './Overlay.svelte';
	import Tooltip from './Tooltip.svelte';

	interface Props {
		show?: boolean;
		tooltip: Snippet;

		children: Snippet;
	}

	let { show, tooltip, children }: Props = $props();

	let anchorElement = $state<HTMLElement>();

	onMount(() => {
		const popover: Popover = {
			anchorElement: anchorElement!,
			component: Tooltip,
			content: tooltip
		};

		globalOverlay.mountPopover(popover);

		return () => {
			globalOverlay.unmountPopover(popover);
		};
	});
</script>

<div class="anchor" bind:this={anchorElement}>
	{@render children()}
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	.anchor {
		display: contents;
	}
</style>
