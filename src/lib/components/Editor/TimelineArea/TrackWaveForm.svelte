<script lang="ts">
	import { fade } from 'svelte/transition';
	import { createWavDataViewS16LE, WaveForm, type WaveFormRange } from './wave-form';

	interface Props {
		width: number;
		height: number;
		wavBuffer: ArrayBuffer;
		range: WaveFormRange;
	}

	let { width, height, wavBuffer, range }: Props = $props();

	let canvas = $state<HTMLCanvasElement>();

	let samples = $derived(createWavDataViewS16LE(wavBuffer));
	let waveForm = $derived(new WaveForm(samples, 8));

	let sampleBins = $state<number[]>([]);

	$effect(() => {
		sampleBins = waveForm.collect(range, width);
	});

	$effect(() => {
		if (canvas && sampleBins && width && height) {
			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error('Canvas context 2d is not available');

			const centerY = height / 2;

			const binCount = sampleBins.length;

			ctx.strokeStyle = '#fff';
			ctx.moveTo(0, centerY);
			ctx.lineTo(width, centerY);

			for (let i = 0; i < binCount; i++) {
				const binValue = sampleBins[i];
				const x = Math.round((width * i) / (binCount - 1)) + 0.5;

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
