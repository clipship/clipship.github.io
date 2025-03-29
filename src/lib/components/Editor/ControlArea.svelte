<script lang="ts">
	import { PauseIcon, PlayIcon, Repeat2Icon, RewindIcon } from '@lucide/svelte';
	import IconButton from '../IconButton.svelte';
	import ToggleButton from '../ToggleButton.svelte';

	interface Props {
		snapToStart: () => void;
		paused: boolean;
		loop: boolean;
	}

	let { snapToStart, paused = $bindable(), loop = $bindable() }: Props = $props();
</script>

<div>
	<IconButton icon={RewindIcon} onclick={snapToStart} color="neutral">Go to Start</IconButton>

	<IconButton icon={paused ? PlayIcon : PauseIcon} onclick={() => (paused = !paused)}>
		{paused ? 'Play' : 'Pause'}
	</IconButton>

	<ToggleButton icon={Repeat2Icon} bind:value={loop} stroke>
		{loop ? 'Disable Loop' : 'Enable Loop'}
	</ToggleButton>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		display: flex;
		justify-content: center;
		gap: 4px;
	}
</style>
