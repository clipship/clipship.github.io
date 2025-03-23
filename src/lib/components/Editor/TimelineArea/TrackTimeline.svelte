<script lang="ts">
	import { fade } from 'svelte/transition';
	import { createWAVDataViewS16LE } from './wav-data-view';

	const INT_16_AMPLITUDE = 1 << 15;

	interface Props {
		wavBuffer?: ArrayBuffer;
	}

	let { wavBuffer }: Props = $props();

	let samples = $derived(wavBuffer ? createWAVDataViewS16LE(wavBuffer) : undefined);

	let canvas = $state<HTMLCanvasElement>();
	let clientWidth = $state<number>(0);
	let clientHeight = $state<number>(0);

	$effect(() => {
		if (canvas && samples && clientWidth && clientHeight) {
			drawCanvas(canvas, samples);
		}
	});

	function drawCanvas(canvas: HTMLCanvasElement, samples: Int16Array) {
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Canvas context 2d is not available');

		const centerY = clientHeight / 2;

		const sampleCount = samples.length;

		ctx.strokeStyle = '#fff';
		ctx.moveTo(0, centerY);
		ctx.lineTo(clientWidth, centerY);

		for (let x = 0; x < clientWidth; x++) {
			const sampleIndex = Math.floor((sampleCount * x) / clientWidth);

			let windowWidth = 200;
			let windowSum = 0;

			for (let i = 0; i < windowWidth; i++) {
				windowSum += Math.abs(samples[sampleIndex - i]);
				windowSum += Math.abs(samples[sampleIndex + i]);
			}

			const sample = windowSum / (windowWidth * 2);
			const sampleFloat = sample / INT_16_AMPLITUDE;

			ctx.moveTo(x + 0.5, centerY + clientHeight * sampleFloat);
			ctx.lineTo(x + 0.5, centerY - clientHeight * sampleFloat);
		}

		ctx.stroke();
	}
</script>

<div bind:clientWidth bind:clientHeight>
	{#if !samples}
		<p>Loading...</p>
	{:else}
		<canvas width={clientWidth} height={clientHeight} bind:this={canvas} transition:fade></canvas>
	{/if}
</div>

<style lang="scss">
	div {
		position: relative;
		display: grid;
		place-content: center;
	}

	canvas {
		position: absolute;
	}
</style>
