import { render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { FFmpegApi, type AudioStreamInput, type ConversionMode } from '../ffmpeg-api';
import FFmpegTestWrapper from './FFmpegTestWrapper.svelte';

import urlSampleVideoMp4 from './samples/sample-multistream.mp4?url';

test('Probe sample video', async () => {
	const ffmpeg = await setupFFmpeg();
	const file = await fetchSampleVideoFile();

	const probedVideoInfo = await ffmpeg.probe(file);
	expect(probedVideoInfo.streams.map((stream) => stream.codec_type)).toEqual(
		expect.arrayContaining(['video', 'audio', 'audio'])
	);
});

test('Extract audio streams from sample video', async () => {
	const ffmpeg = await setupFFmpeg();
	const file = await fetchSampleVideoFile();

	const audioStreamsA = await ffmpeg.extractAudioStreams(file, [0]);
	expect(audioStreamsA).toHaveLength(1);

	const audioStreamsB = await ffmpeg.extractAudioStreams(file, [1]);
	expect(audioStreamsB).toHaveLength(1);

	const audioStreamsC = await ffmpeg.extractAudioStreams(file, [0, 1]);
	expect(audioStreamsC).toHaveLength(2);
});

describe('Extract region from sample video', () => {
	let ffmpeg: FFmpegApi;
	let file: File;

	beforeEach(async () => {
		ffmpeg = await setupFFmpeg();
		file ??= await fetchSampleVideoFile();
	});

	afterEach(async () => {
		await ffmpeg?.dispose();
	});

	describe.sequential.for<
		[
			mode: ConversionMode,
			audioStreams: number,
			singleOutputStream: boolean,
			expectedOutputStreams: number
		]
	>([
		[{ includeVideo: false, outputFormat: 'opus' }, 1, false, 1],
		[{ includeVideo: false, outputFormat: 'opus' }, 2, false, 2],
		[{ includeVideo: false, outputFormat: 'opus' }, 2, true, 1],

		[{ includeVideo: true }, 0, false, 1],
		[{ includeVideo: true }, 1, false, 2],
		[{ includeVideo: true }, 2, false, 3],
		[{ includeVideo: true }, 2, true, 2]
	])(
		'Video: %s, Audio streams: %i (merged: %s)',
		([mode, audioStreamCount, singleOutputStream, expectedOutputStreams]) => {
			const audioStreams = new Array(audioStreamCount)
				.fill(0)
				.map<AudioStreamInput>((_, i) => ({ id: i, volume: 1 }));

			test('No trimming', async () => {
				const { outputFileInFFmpeg } = await ffmpeg.convert(file, {
					mode,
					audio: { streams: audioStreams, singleOutputStream }
				});

				const { format, streams } = await ffmpeg.probe(outputFileInFFmpeg);

				// +- 1.0, the duration may vary to the original
				expect(parseFloat(format.duration)).toBeCloseTo(46.547, 0);
				expect(streams).toHaveLength(expectedOutputStreams);

				const videoStreams = streams.filter((stream) => stream.codec_type === 'video');
				expect(videoStreams.length > 0).toEqual(mode.includeVideo);
			});

			test('Low precision trimming', async () => {
				const { outputFileInFFmpeg } = await ffmpeg.convert(file, {
					trimming: {
						start: 6.5,
						end: 10.25,
						highPrecision: false
					},
					mode,
					audio: { streams: audioStreams, singleOutputStream }
				});

				const { format, streams } = await ffmpeg.probe(outputFileInFFmpeg);

				expect(parseFloat(format.duration)).toBeCloseTo(3.75, 0);
				expect(streams).toHaveLength(expectedOutputStreams);

				const videoStreams = streams.filter((stream) => stream.codec_type === 'video');
				expect(videoStreams.length > 0).toEqual(mode.includeVideo);
			});

			test('High precision trimming', async () => {
				const { outputFileInFFmpeg } = await ffmpeg.convert(file, {
					trimming: {
						start: 6.5,
						end: 10.25,
						highPrecision: true
					},
					mode,
					audio: { streams: audioStreams, singleOutputStream }
				});

				const { format, streams } = await ffmpeg.probe(outputFileInFFmpeg);

				expect(parseFloat(format.start_time)).toBeCloseTo(0);
				expect(parseFloat(format.duration)).toBeCloseTo(3.75);
				expect(streams).toHaveLength(expectedOutputStreams);

				const videoStreams = streams.filter((stream) => stream.codec_type === 'video');
				expect(videoStreams.length > 0).toEqual(mode.includeVideo);
			});
		}
	);
});

async function setupFFmpeg() {
	const ffmpeg = await new Promise<FFmpegApi>((resolve) => {
		render(FFmpegTestWrapper, {
			onReady: (ffmpeg) => resolve(ffmpeg)
		});
	});

	ffmpeg.enableLogging = true;
	return ffmpeg;
}

async function fetchSampleVideoFile() {
	const fileUrl = urlSampleVideoMp4;

	const fileResponse = await fetch(fileUrl);
	const fileBytes = await fileResponse.arrayBuffer();

	const fileName = fileUrl.slice(fileUrl.lastIndexOf('/') + 1);
	return new File([fileBytes], fileName, { type: 'video/mp4' });
}
