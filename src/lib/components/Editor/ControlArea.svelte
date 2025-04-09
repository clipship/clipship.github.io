<script lang="ts">
	import ClapperboardIcon from '@lucide/svelte/icons/clapperboard';
	import FolderUpIcon from '@lucide/svelte/icons/folder-up';
	import PauseIcon from '@lucide/svelte/icons/pause';
	import PlayIcon from '@lucide/svelte/icons/play';
	import Repeat2Icon from '@lucide/svelte/icons/repeat-2';
	import RewindIcon from '@lucide/svelte/icons/rewind';

	import FileInput from '../FileInput.svelte';
	import IconButton from '../IconButton.svelte';
	import ToggleButton from '../ToggleButton.svelte';
	import Timecode from './TimelineArea/Timecode.svelte';

	interface Props {
		snapToStart: () => void;
		paused: boolean;
		loop: boolean;
		currentTime: number;
		duration: number;

		onOpenFile: (file: File) => void;
		exportClip: () => void;
	}

	let {
		snapToStart,
		paused = $bindable(),
		loop = $bindable(),
		currentTime,
		duration,

		onOpenFile,
		exportClip
	}: Props = $props();

	let fileInput = $state<FileInput>();
</script>

<FileInput bind:this={fileInput} onPickFile={onOpenFile} ariaHidden />

<div class="grid">
	<div class="sub-area margin-right">
		<IconButton icon={FolderUpIcon} onclick={() => fileInput!.open()} color="neutral" stroke>
			Open File
		</IconButton>
	</div>

	<div class="sub-area wide-gap">
		<div class="flex left">
			<div class="time">
				<Timecode seconds={currentTime} />
			</div>
		</div>

		<div class="flex">
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

		<div class="flex right">
			<Timecode seconds={duration} />
		</div>
	</div>
	<div class="sub-area margin-left">
		<IconButton icon={ClapperboardIcon} onclick={exportClip} stroke color="secondary">
			Export
		</IconButton>
	</div>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	.grid {
		display: grid;
		grid-template-columns: 1fr max-content 1fr;
	}

	.sub-area {
		display: flex;
		gap: 4px;
		padding: 8px;
		border: 1px solid scheme.var-color('neutral');
		border-radius: 20px;
	}

	.wide-gap {
		gap: 24px;
		padding: 8px 24px;
	}

	.margin-right {
		margin-right: auto;
	}

	.margin-left {
		margin-left: auto;
	}

	.flex {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 4px;
	}

	.time {
		display: flex;
		gap: 0.5em;

		color: scheme.var-color('primary', 1);
		font-weight: bold;
	}

	.left {
		justify-content: left;
	}
	.right {
		justify-content: right;
	}
</style>
