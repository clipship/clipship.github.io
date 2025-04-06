import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import { FFmpegApi } from '../ffmpeg-api';
import FFmpegTestWrapper from './FFmpegTestWrapper.svelte';

import urlSampleVideoMp4 from './samples/sample-ocean.mp4?url';

test('Probe sample video', async () => {
	const ffmpeg = await new Promise<FFmpegApi>((resolve) => {
		render(FFmpegTestWrapper, {
			onReady: (ffmpeg) => resolve(ffmpeg)
		});
	});

	ffmpeg.enableLogging = true;

	const fileResponse = await fetch(urlSampleVideoMp4);
	const fileBytes = await fileResponse.arrayBuffer();
	const file = new File([fileBytes], 'sample.mp4', { type: 'video/mp4' });

	const probedVideoInfo = await ffmpeg.probe(file);
	expect(probedVideoInfo.streams.map((stream) => stream.codec_type)).toEqual(['video', 'audio']);
});
