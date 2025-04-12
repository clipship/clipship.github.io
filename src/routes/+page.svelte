<script lang="ts">
	import Editor from '$lib/components/Editor/Editor.svelte';
	import Dialog from '$lib/components/Overlay/Dialog.svelte';
	import Modal from '$lib/components/Overlay/Modal.svelte';
	import FFmpegProvider from '$lib/ffmpeg/FFmpegProvider.svelte';

	let visible = $state(false);
</script>

<FFmpegProvider>
	<div class="editor" inert={visible}>
		<Editor />
	</div>
</FFmpegProvider>

<Modal>
	<Dialog bind:visible title="Le Dialog Title">This is body.</Dialog>
</Modal>

<svelte:window
	onkeydown={(ev) => {
		if (ev.key === 'd') {
			visible = !visible;
		}
	}}
/>

<style lang="scss">
	.editor {
		display: grid;
		flex: 1;
		margin: 16px;
	}
</style>
