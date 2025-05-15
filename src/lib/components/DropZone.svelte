<script lang="ts">
	import FileUpIcon from '@lucide/svelte/icons/file-up';

	interface Props {
		onDrop: (files: File[]) => void;
	}

	let { onDrop }: Props = $props();

	let isDragging = $state(false);

	function handleDrop(ev: DragEvent) {
		isDragging = false;
		ev.preventDefault();

		const files = ev.dataTransfer?.files;
		if (!files || files.length === 0) return;

		const allFiles = [...files];
		onDrop(allFiles);
	}
</script>

<svelte:window
	ondrop={handleDrop}
	ondragover={(ev) => ev.preventDefault()}
	ondragenter={() => (isDragging = true)}
	ondragleave={(ev) => {
		if (!ev.relatedTarget) {
			isDragging = false;
		}
	}}
/>

<div class="drop-zone" class:dragging={isDragging} aria-hidden={!isDragging} aria-live="assertive">
	<FileUpIcon size={48} />
	<span>Drop to upload.</span>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	.drop-zone {
		position: fixed;
		z-index: 10;
		pointer-events: none;
		top: 48px;
		left: 0;
		right: 0;
		bottom: 0;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-bottom: 1em;
		gap: 8px;
		font-size: 1.25em;
		border: 2px dashed scheme.var-color('primary');
		background-color: #000a;

		transition: 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
		opacity: 0;
		margin: 4px;

		&.dragging {
			opacity: 1;
			margin: 16px;
		}
	}
</style>
