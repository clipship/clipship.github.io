import type { FFFSType, FFmpeg, LogEvent } from '@ffmpeg/ffmpeg';

export const MOUNT_POINT = '/input';

export class FFmpegApi {
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
		await this.ffmpeg.mount(
			// Workaround for the FFFSType enum import which is not available at runtime
			'WORKERFS' as FFFSType.WORKERFS,
			{ files: [file] },
			MOUNT_POINT
		);

		try {
			return await body(`${MOUNT_POINT}/${file.name}`);
		} finally {
			await this.ffmpeg.unmount(MOUNT_POINT);
		}
	}

	async probe(file: File): Promise<FFprobeOutput> {
		const jsonOutputFile = 'ffprobe-output.json';

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
