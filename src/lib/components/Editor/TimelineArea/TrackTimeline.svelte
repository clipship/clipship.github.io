<script lang="ts">
	import TrackWaveForm from './TrackWaveForm.svelte';
	import type { RangeInterval } from './interval-space';

	interface Props {
		wavBuffer?: ArrayBuffer;
		range: RangeInterval;
		isUsed: boolean;
	}

	let { wavBuffer, range, isUsed }: Props = $props();

	let clientWidth = $state<number>();
	let clientHeight = $state<number>();
</script>

<div class:disabled={!isUsed} bind:clientWidth bind:clientHeight>
	{#if !wavBuffer}
		<p>Loading...</p>
	{:else}
		<TrackWaveForm {wavBuffer} {range} width={clientWidth} height={clientHeight} />
	{/if}
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		position: relative;
		display: grid;
		place-content: center;
		background-color: scheme.var-color('primary', -2);
		transition: 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);

		&.disabled {
			filter: grayscale(1);
			opacity: 0.5;
		}
	}
</style>
