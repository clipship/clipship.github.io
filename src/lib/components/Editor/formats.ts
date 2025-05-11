interface Format {
	supportsMultipleAudioStreams: boolean;
}

export const VideoFormats = {
	mp4: {
		supportsMultipleAudioStreams: true
	}
} satisfies Record<string, Format>;

export const AudioFormats = {
	opus: {
		supportsMultipleAudioStreams: true
	}
} satisfies Record<string, Format>;

export type ValidVideoFormat = keyof typeof VideoFormats;
export type ValidAudioFormat = keyof typeof AudioFormats;
export type ValidFormat = ValidVideoFormat | ValidAudioFormat;
