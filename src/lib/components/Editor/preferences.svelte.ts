import type { ValidAudioFormat, ValidVideoFormat } from './formats';

interface EditorPreferences {
	export: ExportPreferences;
}

interface ExportPreferences {
	includeVideo: boolean;
	audioFormat: ValidAudioFormat;
	videoFormat: ValidVideoFormat;
	videoExportMode: VideoExportMode;
	singleAudioOutputStream: boolean;
}

export type VideoExportMode = 'fast' | 're-encode';

export const editorPreferences = $state<EditorPreferences>({
	export: {
		includeVideo: false,
		audioFormat: 'opus',
		videoFormat: 'mp4',
		videoExportMode: 'fast',
		singleAudioOutputStream: true
	}
});
