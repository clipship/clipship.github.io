import type { FFFSType, FFmpeg, LogEvent } from '@ffmpeg/ffmpeg';

const MOUNT_POINT = '/input';

export class FFmpegApi {
	private mountedFile?: File;
	private _enableLogging = false;

	constructor(private readonly ffmpeg: FFmpeg) {
		ffmpeg.createDir(MOUNT_POINT);
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
		}
	}

	private log(ev: LogEvent) {
		console.log(ev.type, ev.message);
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
				...['-v', 'quiet'],
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

	async extractAudioPeaks(file: File, audioStreamId: number) {
		const outputFile = `${file.name}-${audioStreamId}-pcm`;

		await this.useMountedFile(file, (mountedFilePath) =>
			this.ffmpeg.exec([
				// Based on https://trac.ffmpeg.org/wiki/Waveform
				...['-i', mountedFilePath],
				// ...['-filter:a', 'aresample=2000'],
				...['-map', `0:a:${audioStreamId}`],
				...['-c:a', 'pcm_s8'],
				...['-f', 'data'],
				outputFile
			])
		);

		const outputFileData = await this.ffmpeg.readFile(outputFile);

		return new Int8Array(outputFileData as Uint8Array);
	}
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
