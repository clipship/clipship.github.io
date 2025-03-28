<script lang="ts">
	interface Props {
		file: File;

		paused: boolean;
		currentTime: number;
		readonly duration: number;
	}

	let {
		file,
		paused = $bindable(),
		currentTime = $bindable(),
		duration = $bindable()
	}: Props = $props();

	let fileBlobUrl = $derived(URL.createObjectURL(file));
</script>

<div>
	<!-- svelte-ignore a11y_media_has_caption -->
	<video src={fileBlobUrl} muted bind:paused bind:currentTime bind:duration></video>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		position: relative;
		border: 1px solid scheme.var-color('primary');
	}

	video {
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>
