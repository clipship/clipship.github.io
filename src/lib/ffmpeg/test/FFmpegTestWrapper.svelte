<script lang="ts">
	import FFmpegProvider from '../FFmpegProvider.svelte';
	import type { Props } from './FFmpegTest.svelte';
	import FFmpegTest from './FFmpegTest.svelte';

	let { ...props }: Props = $props();
</script>

<FFmpegProvider>
	<FFmpegTest {...props} />
</FFmpegProvider>
