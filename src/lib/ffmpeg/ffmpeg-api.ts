import { FFmpeg, type FFFSType, type LogEvent } from '@ffmpeg/ffmpeg';

import type {
	ValidAudioFormat,
	ValidFormat,
	ValidVideoFormat
} from '$lib/components/Editor/formats';
import urlFFmpegCoreWasm from '@ffmpeg/core/wasm?url';
import urlFFmpegCore from '@ffmpeg/core?url';

const MOUNT_POINT = '/input';

export class FFmpegApi {
	private mountedFile?: File;
	private _enableLogging = false;

	constructor(private readonly ffmpeg: FFmpeg) {
		ffmpeg.createDir(MOUNT_POINT);
	}

	static async load() {
		const ffmpeg = new FFmpeg();
		await ffmpeg.load({
			coreURL: urlFFmpegCore,
			wasmURL: urlFFmpegCoreWasm
		});

		return new FFmpegApi(ffmpeg);
	}

	get enableLogging() {
		return this._enableLogging;
	}

	set enableLogging(enable: boolean) {
		if (enable !== this._enableLogging) {
			if (enable) {
				this.ffmpeg.on('log', this.log);
			} else {
				this.ffmpeg.off('log', this.log);
			}

			this._enableLogging = enable;
		}
	}

	private log(ev: LogEvent) {
		console.log(ev.message);
	}

	private async useMountedFile<T>(file: File, body: (mountedFilePath: string) => Promise<T>) {
		if (this.mountedFile !== file) {
			await this.unmount();

			await this.ffmpeg.mount(
				// Workaround for the FFFSType enum import which is not available at runtime
				'WORKERFS' as FFFSType.WORKERFS,
				{ files: [file] },
				MOUNT_POINT
			);

			this.mountedFile = file;
		}

		return await body(`${MOUNT_POINT}/${file.name}`);
	}

	async unmount() {
		if (this.mountedFile) {
			await this.ffmpeg.unmount(MOUNT_POINT);
			this.mountedFile = undefined;
		}
	}

	async dispose() {
		await this.unmount();
		this.ffmpeg.terminate();
	}

	async probe(file: File | string): Promise<FFprobeOutput> {
		const fileName = file instanceof File ? file.name : file;
		const jsonOutputFile = `${fileName}-ffprobe.json`;

		const probeFilePath = (mountedFilePath: string) =>
			this.ffmpeg.ffprobe([
				...['-loglevel', 'warning'],
				...['-print_format', 'json'],
				'-show_format',
				'-show_streams',
				mountedFilePath,
				...['-o', jsonOutputFile]
			]);

		if (file instanceof File) {
			await this.useMountedFile(file, probeFilePath);
		} else {
			await probeFilePath(file);
		}

		const outputFileData = await this.ffmpeg.readFile(jsonOutputFile, 'utf8');
		return JSON.parse(outputFileData as string);
	}

	async extractAudioStreams(file: File, audioStreamIds: number[]) {
		function getOutputFile(audioStreamId: number) {
			return `${file.name}-${audioStreamId}.wav`;
		}

		await this.useMountedFile(file, (mountedFilePath) => {
			return this.ffmpeg.exec([
				...['-loglevel', 'info'],
				// Always overwrite files
				'-y',
				...['-i', mountedFilePath],
				...audioStreamIds.flatMap((audioStreamId) => [
					// Extract playable audio stream as WAV (16-bit, little endian)
					...['-map', `0:a:${audioStreamId}`],
					...['-c:a', 'pcm_s16le'],
					'-bitexact', // Ensure that the WAV file header is the default size of 44 bytes
					getOutputFile(audioStreamId)
				])
			]);
		});

		const result: AudioStreamExtraction[] = [];

		for (const audioStreamId of audioStreamIds) {
			const audioBytes = await this.ffmpeg.readFile(getOutputFile(audioStreamId));
			const audioBuffer = (audioBytes as Uint8Array).buffer;

			result.push({
				wavBuffer: audioBuffer as ArrayBuffer
			});
		}

		return result;
	}

	async convert(file: File, options: ConvertOptions): Promise<ConversionResult> {
		const { mode, audio, trimming } = options;

		const includeVideo = mode.includeVideo;

		const fileExtensionStart = file.name.lastIndexOf('.');
		const videoFileExtension =
			fileExtensionStart > 0 ? file.name.slice(fileExtensionStart + 1) : undefined;
		const fileNameWithoutExtension =
			fileExtensionStart > 0 ? file.name.slice(0, fileExtensionStart) : file.name;

		const fileExtension = includeVideo ? videoFileExtension : mode.outputFormat;
		const outputFile = `${fileNameWithoutExtension}-trim.${fileExtension}`;

		const reencode = trimming?.highPrecision ?? false;

		await this.useMountedFile(file, (mountedFilePath) => {
			return this.ffmpeg.exec([
				...['-loglevel', 'info'],
				// Always overwrite files
				'-y',

				...['-i', mountedFilePath],

				// Trim input
				...(trimming ? ['-ss', `${trimming.start}`, '-to', `${trimming.end}`] : []),

				// Include video
				...(includeVideo ? ['-map', '0:v?'] : []),

				// Include audio streams
				...audio.streams.flatMap(({ id: audioStreamId }) => ['-map', `0:a:${audioStreamId}`]),

				// Mix audio streams into a single output stream
				...(audio.singleOutputStream && audio.streams.length >= 2
					? [
							'-filter_complex',
							`amix=inputs=${audio.streams.length}:dropout_transition=0:normalize=0`
						]
					: []),

				// Avoid re-encoding to drastically speed up the process
				...(!reencode ? ['-c:v', 'copy'] : []),

				...(!mode.includeVideo
					? this.getFFmpegCodecOptionsForFormat(mode.outputFormat, options)
					: []),

				outputFile
			]);
		});

		const outputFileBytes = await this.ffmpeg.readFile(outputFile);
		const outputFileBuffer = (outputFileBytes as Uint8Array).buffer;

		return {
			outputFileInFFmpeg: outputFile,
			outputBuffer: outputFileBuffer as ArrayBuffer
		};
	}

	private getFFmpegCodecOptionsForFormat(format: ValidFormat, options: ConvertOptions): string[] {
		switch (format) {
			case 'opus':
				return [
					...['-c:a', 'libopus'],

					// Use small frames to achieve high precision output duration
					...(options.trimming ? ['-frame_duration', '2.5'] : [])
				];
			default:
				return [];
		}
	}
}

export interface AudioStreamExtraction {
	wavBuffer: ArrayBuffer;
}

export interface FFprobeStream {
	index: number;
	codec_type: 'video' | 'audio';

	/** Stream offset in seconds, represented as a string. */
	start_time: string;

	/** Duration in seconds, represented as a string. */
	duration: string;
}

export interface FFprobeOutput {
	streams: FFprobeStream[];
	format: {
		/** Offset in seconds, represented as a string. */
		start_time: string;

		/** Duration in seconds, represented as a string. */
		duration: string;
	};
}

export type ConversionMode =
	| {
			includeVideo: true;
			outputFormat?: ValidVideoFormat;
	  }
	| {
			includeVideo: false;
			outputFormat: ValidAudioFormat;
	  };

export interface AudioStreamInput {
	id: number;
	volume: number;
}

export interface ConvertOptions {
	mode: ConversionMode;

	audio: {
		streams: AudioStreamInput[];
		singleOutputStream: boolean;
	};
	trimming?: {
		/** Re-encodes the input (can be very slow with ffmpeg.wasm). */
		highPrecision: boolean;

		/** Start time in seconds. */
		start: number;

		/** End time in seconds. */
		end: number;
	};
}

export interface ConversionResult {
	outputFileInFFmpeg: string;
	outputBuffer: ArrayBuffer;
}
