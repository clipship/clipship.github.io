interface EditorPreferences {
	export: ExportPreferences;
}

interface ExportPreferences {
	includeVideo: boolean;
	singleAudioOutputStream: boolean;
}

export const editorPreferences = $state<EditorPreferences>({
	export: {
		includeVideo: false,
		singleAudioOutputStream: true
	}
});
