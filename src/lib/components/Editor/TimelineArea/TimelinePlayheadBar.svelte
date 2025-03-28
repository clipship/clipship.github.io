<script lang="ts">
	import InteractiveTimelineBar, { timelineA11y } from './InteractiveTimelineBar.svelte';
	import { convertGlobalToRangeSpace, type RangeInterval } from './interval-space';

	interface Props {
		playhead: number;
		mediaPlayhead: number;
		visibleRange: RangeInterval;
	}

	let { playhead = $bindable(), mediaPlayhead, visibleRange }: Props = $props();

	let playheadInView = $derived(convertGlobalToRangeSpace(playhead, visibleRange));
	let mediaPlayheadInView = $derived(convertGlobalToRangeSpace(mediaPlayhead, visibleRange));

	type Draggable = 'playhead';
	let dragging = $state<Draggable>();

	function onDrag(delta: number) {
		if (dragging === 'playhead') {
			playhead = Math.min(Math.max(playhead + delta, 0), 1);
		}
	}

	function onBarInteract(ev: MouseEvent, mouseInInterval: number) {
		if (ev.buttons === 1) {
			playhead = mouseInInterval;
			dragging = 'playhead';
		}
	}
</script>

<InteractiveTimelineBar bind:dragging {visibleRange} {onBarInteract} {onDrag}>
	{#snippet children(clientWidth, eventStartDragging)}
		<div class="playhead" style="--x: {mediaPlayheadInView * clientWidth}px;"></div>

		<div
			class="playhead cursor"
			class:dragging={dragging === 'playhead'}
			style="--x: {playheadInView * clientWidth}px;"
			use:timelineA11y={{
				value: playhead,
				onmousedown: eventStartDragging('playhead')
			}}
		></div>
	{/snippet}
</InteractiveTimelineBar>

<style lang="scss">
	@use '$lib/style/scheme';

	$handle-width: 10px;
	$handle-interaction-padding: 20px;

	.playhead {
		position: absolute;
		height: 100%;
		width: $handle-width;

		cursor: ew-resize;
		border-radius: 0 0 100vw 100vw;
		transform: translateX(calc(var(--x) - $handle-width / 2));
		background-color: scheme.var-color('primary');

		&.cursor {
			background-color: white;

			&:hover,
			&.dragging {
				background-color: scheme.var-color('primary', 1);
			}
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: -$handle-interaction-padding;
			right: -$handle-interaction-padding;
		}
	}
</style>
