<script lang="ts">
	import PauseIcon from '@lucide/svelte/icons/pause';
	import PlayIcon from '@lucide/svelte/icons/play';
	import Repeat2Icon from '@lucide/svelte/icons/repeat-2';
	import RewindIcon from '@lucide/svelte/icons/rewind';
	import ScissorsIcon from '@lucide/svelte/icons/scissors';

	import { untrack } from 'svelte';
	import IconButton from '../IconButton.svelte';
	import ToggleButton from '../ToggleButton.svelte';
	import Timecode from './TimelineArea/Timecode.svelte';

	interface Props {
		snapToStart: () => void;
		paused: boolean;
		loop: boolean;
		isTrimmingActive: boolean;
		setTrimmingActive: (active: boolean) => void;
		currentTime: number;
		duration: number;
	}

	let {
		snapToStart,
		paused = $bindable(),
		loop = $bindable(),
		isTrimmingActive,
		setTrimmingActive,
		currentTime,
		duration
	}: Props = $props();

	let enableTrimming = $state(isTrimmingActive);

	$effect(() => {
		// Updates the locally bound state when "isTrimmingActive" toggles
		enableTrimming = isTrimmingActive;
	});

	$effect(() => {
		if (enableTrimming !== isTrimmingActive) {
			untrack(() => setTrimmingActive(enableTrimming));
		}
	});
</script>

<div class="grid">
	<div class="left">
		<ToggleButton
			icon={ScissorsIcon}
			bind:value={enableTrimming}
			stroke
			color="secondary"
			disableMouseFocus
		>
			{enableTrimming ? 'Disable Trim' : 'Enable Trim'}
		</ToggleButton>

		<div class="time">
			<Timecode seconds={currentTime} /> / <Timecode seconds={duration} />
		</div>
	</div>

	<div>
		<IconButton icon={RewindIcon} onclick={snapToStart} color="neutral" disableMouseFocus>
			Go to Start
		</IconButton>

		<IconButton
			icon={paused ? PlayIcon : PauseIcon}
			onclick={() => (paused = !paused)}
			disableMouseFocus
		>
			{paused ? 'Play' : 'Pause'}
		</IconButton>

		<ToggleButton icon={Repeat2Icon} bind:value={loop} stroke disableMouseFocus>
			{loop ? 'Disable Loop' : 'Enable Loop'}
		</ToggleButton>
	</div>

	<div class="right">
		<!-- <IconButton icon={RewindIcon} onclick={snapToStart} color="neutral" disableMouseFocus>
			Export
		</IconButton> -->
	</div>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	.grid {
		display: grid;
		grid-template-columns: 1fr max-content 1fr;

		> div {
			display: flex;
			align-items: center;
			gap: 4px;
		}
	}

	.time {
		display: flex;
		gap: 16px;
		margin: 0 auto;
	}

	.left {
		justify-content: left;
	}
	.right {
		justify-content: right;
	}
</style>
