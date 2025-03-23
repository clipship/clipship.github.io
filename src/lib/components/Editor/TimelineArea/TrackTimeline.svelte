<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		pcmData?: Int8Array;
	}

	let { pcmData }: Props = $props();
	let canvas = $state<HTMLCanvasElement>();
	let clientWidth = $state<number>(0);
	let clientHeight = $state<number>(0);

	$effect(() => {
		if (canvas && pcmData && clientWidth && clientHeight) {
			drawCanvas(canvas, pcmData);
		}
	});

	function drawCanvas(canvas: HTMLCanvasElement, pcmData: Int8Array) {
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Canvas context 2d is not available');

		const centerY = clientHeight / 2;

		const sampleCount = pcmData.length;

		ctx.strokeStyle = '#fff';
		ctx.moveTo(0, centerY);
		ctx.lineTo(clientWidth, centerY);

		for (let x = 0; x < clientWidth; x++) {
			const sampleIndex = Math.floor((sampleCount * x) / clientWidth);

			let windowWidth = 200;
			let windowSum = 0;

			for (let i = 0; i < windowWidth; i++) {
				windowSum += Math.abs(pcmData[sampleIndex - i]);
				windowSum += Math.abs(pcmData[sampleIndex + i]);
			}

			const sample = windowSum / (windowWidth * 2);
			const sampleFloat = sample / 127;

			ctx.moveTo(x + 0.5, centerY + clientHeight * sampleFloat);
			ctx.lineTo(x + 0.5, centerY - clientHeight * sampleFloat);
		}

		ctx.stroke();
	}
</script>

<div bind:clientWidth bind:clientHeight>
	{#if !pcmData}
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
