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
		function getOutputFile(audioStreamId: number, extension: 'pcm' | 'opus') {
			return `${file.name}-${audioStreamId}.${extension}`;
		}

		await this.useMountedFile(file, (mountedFilePath) => {
			return this.ffmpeg.exec([
				...['-loglevel', 'info'],
				// Always overwrite files
				'-y',
				...['-i', mountedFilePath],
				...audioStreamIds.flatMap((audioStreamId) => [
					// Extract low quality audio samples for peak visualization
					...[
						...['-map', `0:a:${audioStreamId}`],
						// ...['-filter:a', 'aresample=2000'],
						...['-c:a', 'pcm_s8'],
						...['-f', 'data'],
						getOutputFile(audioStreamId, 'pcm')
					],

					// Extract playable audio stream
					...[
						...['-map', `0:a:${audioStreamId}`],
						...['-b:a', '96000'],
						...['-c:a', 'libopus'],
						...['-compression_level', '0'],
						getOutputFile(audioStreamId, 'opus')
					]
				])
			]);
		});

		const result: AudioStreamExtraction[] = [];

		for (const audioStreamId of audioStreamIds) {
			const pcmFileData = await this.ffmpeg.readFile(getOutputFile(audioStreamId, 'pcm'));
			const audioBytes = await this.ffmpeg.readFile(getOutputFile(audioStreamId, 'opus'));
			const audioBuffer = (audioBytes as Uint8Array).buffer as ArrayBuffer;

			result.push({
				pcmData: new Int8Array(pcmFileData as Uint8Array),
				audioBlob: new Blob([audioBuffer])
			});
		}

		return result;
	}
}

interface AudioStreamExtraction {
	pcmData: Int8Array;
	audioBlob: Blob;
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
