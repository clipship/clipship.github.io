<script lang="ts">
	import Editor from '$lib/components/Editor/Editor.svelte';
	import FFmpegProvider from '$lib/components/util/FFmpegProvider.svelte';
</script>

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
	}
</style>
