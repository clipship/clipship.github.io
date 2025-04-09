<script lang="ts">
	interface Props {
		ariaHidden?: boolean;
		onPickFile: (file: File) => void;
	}

	let { ariaHidden, onPickFile }: Props = $props();

	let input = $state<HTMLInputElement>();
	let files = $state<FileList>();
	let pickedFile = $derived(files ? files.item(0) : null);

	$effect(() => {
		if (pickedFile) {
			onPickFile(pickedFile);
		}
	});

	export function open() {
		input!.click();
	}
</script>

<input type="file" bind:this={input} bind:files hidden={ariaHidden === true} />

<style lang="scss">
	input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
</style>
