<script lang="ts" module>
	export const FFMPEG_CORE_PACKAGE = '@ffmpeg/core-mt@0.12.9';
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
	import { FFmpeg } from '@ffmpeg/ffmpeg';
	import { getContext, setContext, type Snippet } from 'svelte';
	import { readonly, writable, type Readable } from 'svelte/store';

	import urlFFmpegCoreWasm from '@ffmpeg/core/wasm?url';
	import urlFFmpegCore from '@ffmpeg/core?url';
	import { FFmpegApi } from './ffmpeg-api';

	const ffmpegStore = writable<FFmpegApi | undefined>();
	let hasLoadingStarted = false;

	async function loadFFmpeg() {
		const ffmpeg = new FFmpeg();
		await ffmpeg.load({
			coreURL: urlFFmpegCore,
			wasmURL: urlFFmpegCoreWasm
		});

		ffmpegStore.set(new FFmpegApi(ffmpeg));
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
