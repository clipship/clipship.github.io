<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { RangeInterval } from './interval-space';
	import { createWavDataViewS16LE, WaveForm } from './wave-form';

	interface Props {
		width: number;
		height: number;
		wavBuffer: ArrayBuffer;
		range: RangeInterval;
	}

	let { width, height, wavBuffer, range }: Props = $props();

	let canvas = $state<HTMLCanvasElement>();
	let ctx = $derived(canvas ? canvas.getContext('2d') : undefined);

	let samples = $derived(createWavDataViewS16LE(wavBuffer));
	let waveForm = $derived(new WaveForm(samples, 16));

	// eslint-disable-next-line svelte/prefer-writable-derived
	let sampleBins = $state<number[]>([]);

	$effect(() => {
		sampleBins = waveForm.collect(range, width);

		// // Uncomment to take SCSS edits into account live
		// cssColorVariableValue = window
		// 	.getComputedStyle(document.body)
		// 	.getPropertyValue('--color-wave-form');
	});

	let cssColorVariableValue = $state(
		window.getComputedStyle(document.body).getPropertyValue('--color-wave-form')
	);

	$effect(() => {
		if (ctx && width && height && sampleBins) {
			const centerY = height / 2;

			ctx.clearRect(0, 0, width, height);
			ctx.strokeStyle = cssColorVariableValue;
			ctx.beginPath();

			ctx.moveTo(0, centerY);
			ctx.lineTo(width, centerY);

			const binCount = sampleBins.length;
			for (let i = 0; i < binCount; i++) {
				const binValue = sampleBins[i];
				const x = Math.floor((width * i) / (binCount - 1)) + 0.5;

				ctx.moveTo(x, centerY - height * binValue);
				ctx.lineTo(x, centerY + height * binValue);
			}

			ctx.stroke();
		}
	});
</script>

<canvas {width} {height} bind:this={canvas} transition:fade></canvas>

<style lang="scss">
	canvas {
		position: absolute;
	}
</style>
