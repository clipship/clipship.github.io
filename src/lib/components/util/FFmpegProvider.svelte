<script lang="ts" module>
	export const FFMPEG_CORE_PACKAGE = '@ffmpeg/core-mt@0.12.9';
	export const FFMPEG_CONTEXT_KEY = 'ffmpeg-provider-context';

	interface FFmpegContext {
		ffmpeg: Readable<FFmpeg | undefined>;
		downloadProgress: Readable<DownloadProgress | undefined>;
		startDownload(): void;
	}

	export interface DownloadProgress {
		received: number;
		total: number;
	}

	export function useFFmpeg() {
		return getContext<FFmpegContext>(FFMPEG_CONTEXT_KEY);
	}
</script>

<script lang="ts">
	import { FFmpeg, type FFMessageLoadConfig } from '@ffmpeg/ffmpeg';
	import { toBlobURL } from '@ffmpeg/util';
	import { getContext, setContext, type Snippet } from 'svelte';
	import { derived, readonly, writable, type Readable } from 'svelte/store';

	import urlFFmpegCoreWasm from '@ffmpeg/core/wasm?url';
	import urlFFmpegCore from '@ffmpeg/core?url';

	interface Download<T> {
		progress: Readable<DownloadProgress>;
		result: Readable<T | undefined>;
	}

	function startFileDownload(url: string, mimeType: string) {
		return new Promise<Download<string>>((resolve) => {
			let isTotalSizeKnown = false;

			const progressStore = writable<DownloadProgress>();
			const resultStore = writable<string | undefined>();

			toBlobURL(url, mimeType, true, (ev) => {
				progressStore.set({
					received: ev.received,
					total: ev.total
				});

				if (!isTotalSizeKnown) {
					isTotalSizeKnown = true;
					resolve({
						progress: readonly(progressStore),
						result: readonly(resultStore)
					});
				}
			}).then((blobUrl) => resultStore.set(blobUrl));
		});
	}

	async function loadFFmpeg() {
		const downloadCore = await startFileDownload(urlFFmpegCore, 'text/javascript');
		const downloadWasm = await startFileDownload(urlFFmpegCoreWasm, 'application/wasm');
		// const downloadWorker = await startFileDownload('ffmpeg-core.worker.js', 'text/javascript');

		const progress = derived([downloadCore.progress, downloadWasm.progress], (allProgresses) => {
			return allProgresses.reduce<DownloadProgress>(
				(singleProgress, others) => ({
					received: singleProgress.received + others.received,
					total: singleProgress.total + others.total
				}),
				{ received: 0, total: 0 }
			);
		});

		const unsubscribeFromProgress = progress.subscribe(downloadProgressStore.set);

		const blobUrlsStore = derived(
			[downloadCore.result, downloadWasm.result],
			([coreURL, wasmURL]) => {
				console.log(urlFFmpegCore, urlFFmpegCoreWasm);
				if (!coreURL || wasmURL) {
					return undefined;
				}

				return { coreURL, wasmURL } as FFMessageLoadConfig;
			}
		);

		const blobUrls = await new Promise<FFMessageLoadConfig>((resolve) => {
			const unsubscribe = blobUrlsStore.subscribe((blobUrls) => {
				if (blobUrls) {
					resolve(blobUrls);
					unsubscribe();
				}
			});
		});

		const ffmpeg = new FFmpeg();
		await ffmpeg.load(blobUrls);

		ffmpegStore.set(ffmpeg);

		unsubscribeFromProgress();
	}

	const ffmpegStore = writable<FFmpeg | undefined>();
	const downloadProgressStore = writable<DownloadProgress | undefined>();

	let hasDownloadStarted = false;

	setContext<FFmpegContext>(FFMPEG_CONTEXT_KEY, {
		ffmpeg: readonly(ffmpegStore),
		downloadProgress: readonly(downloadProgressStore),

		startDownload() {
			if (hasDownloadStarted) return;

			hasDownloadStarted = true;
			loadFFmpeg();
		}
	});

	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
