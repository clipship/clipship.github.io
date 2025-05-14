<script lang="ts">
	import BarButton from '$lib/components/BarButton.svelte';
	import Checkbox from '$lib/components/Checkbox.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import Setting from '$lib/components/Setting.svelte';
	import {
		editorPreferences,
		type VideoExportMode
	} from '../../../client-state/preferences.svelte';
	import { AudioFormats, VideoFormats } from '../formats';
	import Duration from './Duration.svelte';

	const VIDEO_EXPORT_MODES: VideoExportMode[] = ['fast', 're-encode'];

	interface Props {
		trackCount: number;
		clipDurationInSeconds: number;
		supportsMultipleAudioStreams: boolean;
	}

	let { trackCount, clipDurationInSeconds, supportsMultipleAudioStreams }: Props = $props();

	const settings = editorPreferences.value.export;
</script>

<div class="content">
	<div class="info">
		Export a <em><Duration seconds={clipDurationInSeconds} /></em> long clip of your video with
		<em>
			<!-- TODO: Replace with actual i18n -->
			{#if trackCount === 1}
				1 audio track
			{:else}
				{trackCount} audio tracks
			{/if}
		</em>.
	</div>

	<div class="button-bar">
		<BarButton onclick={() => (settings.includeVideo = false)} active={!settings.includeVideo}
			>Audio</BarButton
		>
		<BarButton onclick={() => (settings.includeVideo = true)} active={settings.includeVideo}
			>Video</BarButton
		>
	</div>

	{#if !settings.includeVideo}
		<Setting headline="Format">
			Select the output format.

			{#snippet trailing()}
				<Dropdown options={Object.keys(AudioFormats)} bind:value={settings.audioFormat} />
			{/snippet}
		</Setting>
	{:else}
		<Setting headline="Video Export Mode">
			Select the processing method.

			{#snippet trailing()}
				<Dropdown options={VIDEO_EXPORT_MODES} bind:value={settings.videoExportMode} />
			{/snippet}
		</Setting>

		<Setting headline="Format" disabled={settings.videoExportMode !== 're-encode'}>
			Select the output format.

			{#snippet trailing()}
				<Dropdown options={Object.keys(VideoFormats)} bind:value={settings.videoFormat} />
			{/snippet}
		</Setting>
	{/if}

	{#if trackCount >= 2}
		<Setting headline="Single Audio Track" disabled={!supportsMultipleAudioStreams}>
			{#if supportsMultipleAudioStreams}
				If enabled, the {trackCount} audio tracks will be mixed into one.
			{:else}
				The selected format <b>only supports</b> a single audio track.
			{/if}

			{#snippet trailing()}
				{#if supportsMultipleAudioStreams}
					<Checkbox bind:checked={settings.singleAudioOutputStream} />
				{:else}
					<Checkbox checked={true} />
				{/if}
			{/snippet}
		</Setting>
	{/if}
</div>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.button-bar {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		padding: 0 64px;
		align-items: stretch;
	}
</style>
