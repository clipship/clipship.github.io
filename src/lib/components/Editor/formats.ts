interface Format {
	hasVideo: boolean;
	supportsMultipleAudioStreams: boolean;
}

export const Formats = {
	mp4: {
		hasVideo: true,
		supportsMultipleAudioStreams: true
	},
	opus: {
		hasVideo: false,
		supportsMultipleAudioStreams: true
	}
} satisfies Record<string, Format>;

export type ValidFormat = keyof typeof Formats;
