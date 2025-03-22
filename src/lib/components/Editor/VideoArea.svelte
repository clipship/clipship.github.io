<script lang="ts">
	import FilePicker from './FilePicker.svelte';

	interface Props {
		file?: File;
	}

	let { file: pickedFile = $bindable() }: Props = $props();

	let pickedFileBlobUrl = $derived(pickedFile ? URL.createObjectURL(pickedFile) : undefined);
</script>

<div class:default-size={pickedFile === undefined}>
	{#if !pickedFileBlobUrl}
		<FilePicker onPickFile={(file) => (pickedFile = file)} />
	{:else}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video src={pickedFileBlobUrl} controls></video>
	{/if}
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		display: grid;
		place-content: center;
		border: 1px solid scheme.var-color('primary');
		position: relative;

		&.default-size {
			min-height: 200px;
		}
	}

	video {
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>
