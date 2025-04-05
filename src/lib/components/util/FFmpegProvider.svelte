<script lang="ts" module>
	export const FFMPEG_CONTEXT_KEY = 'ffmpeg-provider-context';

	interface FFmpegContext {
		ffmpeg: Readable<FFmpegApi | undefined>;
		startLoading(): void;
	}

	export function useFFmpeg() {
		return getContext<FFmpegContext>(FFMPEG_CONTEXT_KEY);
	}
</script>

<script lang="ts">
	import { getContext, setContext, type Snippet } from 'svelte';
	import { readonly, writable, type Readable } from 'svelte/store';

	import { FFmpegApi } from './ffmpeg-api';

	const ffmpegStore = writable<FFmpegApi | undefined>();
	let hasLoadingStarted = false;

	async function loadFFmpeg() {
		const ffmpegApi = await FFmpegApi.load();
		ffmpegStore.set(ffmpegApi);
	}

	setContext<FFmpegContext>(FFMPEG_CONTEXT_KEY, {
		ffmpeg: readonly(ffmpegStore),

		startLoading() {
			if (hasLoadingStarted) return;

			hasLoadingStarted = true;
			loadFFmpeg();
		}
	});

	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
