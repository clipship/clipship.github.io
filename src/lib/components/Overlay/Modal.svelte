<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { globalOverlay, ModalState } from './Overlay.svelte';

	interface Props {
		visible: boolean;
		children: Snippet;
	}

	let { visible, children }: Props = $props();

	let modalState = $state<ModalState>();

	$effect(() => {
		if (modalState) {
			modalState.visible = visible;
		}
	});

	onMount(() => {
		modalState = globalOverlay.mountModal({ modal: children });

		return () => {
			modalState!.unmount();
		};
	});
</script>
