<script lang="ts">
	import PauseIcon from '@lucide/svelte/icons/pause';
	import PlayIcon from '@lucide/svelte/icons/play';
	import IconButton from '../IconButton.svelte';

	interface Props {
		paused: boolean;
	}

	let { paused = $bindable() }: Props = $props();
</script>

<div>
	<IconButton icon={paused ? PlayIcon : PauseIcon} onclick={() => (paused = !paused)}>
		{paused ? 'Play' : 'Pause'}
	</IconButton>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		display: flex;
		justify-content: center;
	}
</style>
