import urlFFmpegCoreWasm from '@ffmpeg/core/wasm?url';
import urlFFmpegCore from '@ffmpeg/core?url';
import { FFmpeg, type FFFSType, type LogEvent } from '@ffmpeg/ffmpeg';

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

	async probe(file: File): Promise<FFprobeOutput> {
		const jsonOutputFile = `${file.name}-ffprobe.json`;

		await this.useMountedFile(file, (mountedFilePath) =>
			this.ffmpeg.ffprobe([
				...['-loglevel', 'warning'],
				...['-print_format', 'json'],
				'-show_format',
				'-show_streams',
				mountedFilePath,
				...['-o', jsonOutputFile]
			])
		);

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
}

export interface AudioStreamExtraction {
	wavBuffer: ArrayBuffer;
}

interface FFprobeStream {
	index: number;
	codec_type: 'video' | 'audio';

	/** Stream offset in seconds, represented as a string. */
	start_time: string;

	/** Duration in seconds, represented as a string. */
	duration: string;
}

export interface FFprobeOutput {
	streams: FFprobeStream[];
}
