import type { ValidAudioFormat, ValidVideoFormat } from '../components/Editor/formats';
import { Persisted, persisted } from './persisted-state.svelte';

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

export let editorPreferences: Persisted<EditorPreferences>;

$effect.root(() => {
	editorPreferences = persisted<EditorPreferences>('preferences', {
		export: {
			includeVideo: false,
			audioFormat: 'opus',
			videoFormat: 'mp4',
			videoExportMode: 'fast',
			singleAudioOutputStream: true
		}
	});
});
