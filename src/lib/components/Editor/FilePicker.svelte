<script lang="ts">
	interface Props {
		onPickFile: (file: File) => void;
	}

	let { onPickFile }: Props = $props();

	let files = $state<FileList>();
	let pickedFile = $derived(files ? files.item(0) : null);

	$effect(() => {
		if (pickedFile) {
			onPickFile(pickedFile);
		}
	});
</script>

<label>
	Open video file

	<input type="file" bind:files />
</label>

<style lang="scss">
	@use '$lib/style/components';

	label {
		@extend %button;
	}

	input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
</style>
