<script lang="ts">
	import PauseIcon from '@lucide/svelte/icons/pause';
	import PlayIcon from '@lucide/svelte/icons/play';
	import RewindIcon from '@lucide/svelte/icons/rewind';
	import IconButton from '../IconButton.svelte';

	interface Props {
		snapToStart: () => void;
		paused: boolean;
	}

	let { snapToStart, paused = $bindable() }: Props = $props();
</script>

<div>
	<IconButton icon={RewindIcon} onclick={snapToStart}>Go to Start</IconButton>

	<IconButton icon={paused ? PlayIcon : PauseIcon} onclick={() => (paused = !paused)}>
		{paused ? 'Play' : 'Pause'}
	</IconButton>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		display: flex;
		justify-content: center;
		gap: 4px;
	}
</style>
