import { FFmpeg, type FFFSType, type LogEvent, type LogEventCallback } from '@ffmpeg/ffmpeg';

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

	private log({ message }: LogEvent) {
		// Prevent excessive progress messages from getting logged
		if (message.trim().includes(' ') || !message.includes('=')) {
			console.log(message);
		}
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

	private async exec(args: string[]) {
		if (this._enableLogging) {
			console.log(
				'Running',
				['ffmpeg', ...args.map((arg) => (arg.includes(' ') ? `"${arg}"` : arg))].join(' '),
				args
			);
		}
		return await this.ffmpeg.exec(args);
	}

	private async execWithLogCallback(onLog: LogEventCallback, args: string[]) {
		this.ffmpeg.on('log', onLog);
		try {
			return await this.exec(args);
		} finally {
			this.ffmpeg.off('log', onLog);
		}
	}

	private async execWithProgressTimeCallback(
		onProgress: (processedSeconds: number) => void,
		args: string[]
	) {
		// Example progress message log:
		// [...] out_time_us=1876917 [\n] out_time_ms=1876917 [\n] out_time=00:00:01.876917 [...]
		const outTimeUsPrefix = 'out_time_us=';

		return await this.execWithLogCallback(({ message }) => {
			const prefixIndex = message.indexOf(outTimeUsPrefix);

			if (prefixIndex >= 0) {
				const outTimeUsSlice = message.slice(prefixIndex + outTimeUsPrefix.length);

				const outTimeMicroseconds = Number(outTimeUsSlice);
				onProgress(outTimeMicroseconds / 1000 / 1000);
			}
		}, args);
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
			return this.exec([
				...['-loglevel', 'info'],
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

		const shouldApplySingleAudio = audio.singleOutputStream && audio.streams.length >= 2;

		const onProgress = options.onProgress ?? (() => {});

		await this.useMountedFile(file, (mountedFilePath) => {
			return this.execWithProgressTimeCallback(onProgress, [
				...['-loglevel', 'info'],
				...['-progress', '-', '-nostats'],

				// Trim input
				...(trimming ? ['-ss', `${trimming.start}`, '-to', `${trimming.end}`] : []),

				...['-i', mountedFilePath],

				// Include video
				...(includeVideo ? ['-map', '0:v?'] : []),

				// Mix audio streams into a single output stream
				...(shouldApplySingleAudio
					? ['-filter_complex', this.createFFmpegAmixFilter(audio.streams)]
					: []),

				// Adjust audio stream volume separately
				...(!shouldApplySingleAudio && audio.streams.length > 0
					? [
							'-filter_complex',
							audio.streams
								.map(({ id, volume }) => `[0:a:${id}] volume=${volume} [a${id}]`)
								.join('; '),

							...audio.streams.flatMap(({ id }) => ['-map', `[a${id}]`])
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

	private createFFmpegAmixFilter(streams: AudioStreamInput[]) {
		const inputStreamSelection = streams.map(({ id }) => `[0:a:${id}]`).join('');

		const weights = streams.map((stream) => stream.volume.toFixed(3)).join(' ');

		return `${inputStreamSelection} amix=inputs=${streams.length}:dropout_transition=0:normalize=0:weights='${weights}'`;
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

	onProgress?: (processedOutputSeconds: number) => void;
}

export interface ConversionResult {
	outputFileInFFmpeg: string;
	outputBuffer: ArrayBuffer;
}
