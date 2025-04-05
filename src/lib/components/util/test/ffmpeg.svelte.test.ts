import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import { FFmpegApi } from '../ffmpeg-api';
import FFmpegTestWrapper from './FFmpegTestWrapper.svelte';

test('FFmpeg works', async () => {
	const ffmpeg = await new Promise<FFmpegApi>((resolve) => {
		render(FFmpegTestWrapper, {
			onReady: (ffmpeg) => resolve(ffmpeg)
		});
	});

	expect(ffmpeg).toBeDefined();

	ffmpeg.enableLogging = true;

	// const probedVideoInfo = await ffmpeg.probe();
	// expect(probedVideoInfo.streams.map((stream) => stream.codec_type)).toEqual(['video', 'audio']);
});
