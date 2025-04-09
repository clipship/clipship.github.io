<script lang="ts">
	interface Props {
		file: File;

		unpauseOnEnd: boolean;
		paused: boolean;
		currentTime: number;
		readonly duration: number;
	}

	let {
		file,
		unpauseOnEnd,
		paused = $bindable(),
		currentTime = $bindable(),
		duration = $bindable()
	}: Props = $props();

	let fileBlobUrl = $derived(URL.createObjectURL(file));
</script>

<div>
	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		src={fileBlobUrl}
		muted
		bind:paused
		bind:currentTime
		bind:duration
		onended={() => {
			if (unpauseOnEnd) {
				paused = false;
			}
		}}
	></video>
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
