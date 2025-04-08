<script lang="ts">
	import { onMount } from 'svelte';
	import { useFFmpeg } from '../FFmpegProvider.svelte';
	import type { FFmpegApi } from '../ffmpeg-api';

	export interface Props {
		onReady: (ffmpeg: FFmpegApi) => void;
	}

	let { onReady }: Props = $props();

	const { ffmpeg, startLoading } = useFFmpeg();

	$effect(() => {
		if ($ffmpeg !== undefined) {
			onReady($ffmpeg);
		}
	});

	onMount(() => {
		startLoading();
	});
</script>
