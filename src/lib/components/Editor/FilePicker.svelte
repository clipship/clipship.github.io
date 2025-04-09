<script lang="ts">
	import FileInput from '../FileInput.svelte';

	interface Props {
		onPickFile: (file: File) => void;
	}

	let { onPickFile }: Props = $props();
</script>

<label>
	Open video file

	<FileInput {onPickFile} />
</label>

<style lang="scss">
	@use '$lib/style/components';

	label {
		@extend %button;
	}
</style>
