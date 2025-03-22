<script lang="ts">
	import FilePicker from './FilePicker.svelte';

	let pickedFile = $state<File>();
	let pickedFileBlobUrl = $derived(pickedFile ? URL.createObjectURL(pickedFile) : undefined);

	let videoElement = $state<HTMLMediaElement>();

	// $effect(() => {
	// 	if (videoElement) {
	// 	}
	// });

	function onLoadedMetadata() {
		// @ts-expect-error captureStream() is not available in Firefox
		const mediaStream: MediaStream = videoElement!.captureStream();

		console.log(mediaStream);
		console.log(mediaStream.getAudioTracks());
	}
</script>

<div class:default-size={pickedFile === undefined}>
	{#if !pickedFileBlobUrl}
		<FilePicker onPickFile={(file) => (pickedFile = file)} />
	{:else}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			src={pickedFileBlobUrl}
			bind:this={videoElement}
			onloadedmetadata={onLoadedMetadata}
			controls
		></video>
	{/if}
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		display: grid;
		place-content: center;
		border: 1px solid scheme.var-color('primary');

		&.default-size {
			min-height: 200px;
		}
	}

	video {
		width: 100%;
		height: 100%;
	}
</style>
