<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { globalOverlay } from './Overlay.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		const modalState = globalOverlay.mountModal({ modal: children });

		return () => {
			modalState!.unmount();
		};
	});
</script>
