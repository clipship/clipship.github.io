interface Format {
	mimeType: string;
	supportsMultipleAudioStreams: boolean;
}

export const VideoFormats = {
	mp4: {
		mimeType: 'video/mp4',
		supportsMultipleAudioStreams: true
	}
} satisfies Record<string, Format>;

export const AudioFormats = {
	opus: {
		mimeType: 'audio/opus',
		supportsMultipleAudioStreams: true
	},
	mp3: {
		mimeType: 'audio/mp3',
		supportsMultipleAudioStreams: false
	}
} satisfies Record<string, Format>;

export const AllFormats = {
	...VideoFormats,
	...AudioFormats
};

export type ValidVideoFormat = keyof typeof VideoFormats;
export type ValidAudioFormat = keyof typeof AudioFormats;
export type ValidFormat = ValidVideoFormat | ValidAudioFormat;
