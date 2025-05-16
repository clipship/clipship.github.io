<script lang="ts">
	import { pageState } from '$lib/client-state/page-state.svelte';
	import Editor from '$lib/components/Editor/Editor.svelte';
	import FFmpegProvider from '$lib/ffmpeg/FFmpegProvider.svelte';
</script>

<svelte:head>
	<title>{pageState.windowTitle}</title>
</svelte:head>

<FFmpegProvider>
	<div class="editor">
		<Editor />
	</div>
</FFmpegProvider>

<style lang="scss">
	.editor {
		display: grid;
		flex: 1;
		margin: 16px;
		margin-top: 0;
	}
</style>
