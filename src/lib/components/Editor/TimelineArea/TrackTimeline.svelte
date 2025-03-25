<script lang="ts">
	import TrackWaveForm from './TrackWaveForm.svelte';
	import type { RangeInterval } from './interval-space';

	interface Props {
		wavBuffer?: ArrayBuffer;
		range: RangeInterval;
	}

	let { wavBuffer, range }: Props = $props();

	let clientWidth = $state<number>();
	let clientHeight = $state<number>();
</script>

<div bind:clientWidth bind:clientHeight>
	{#if !wavBuffer}
		<p>Loading...</p>
	{:else}
		<TrackWaveForm {wavBuffer} {range} width={clientWidth} height={clientHeight} />
	{/if}
</div>

<style lang="scss">
	div {
		position: relative;
		display: grid;
		place-content: center;
	}
</style>
