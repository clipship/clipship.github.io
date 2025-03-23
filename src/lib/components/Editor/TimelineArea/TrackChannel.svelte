<script lang="ts">
	export interface TrackChannelProps {
		name: string;
		isUsed: boolean;
		audioBlob?: Blob;
	}

	let { name, isUsed = $bindable(), audioBlob }: TrackChannelProps = $props();

	let blobUrl = $derived(audioBlob ? URL.createObjectURL(audioBlob) : undefined);
</script>

<div>
	<span>{name}</span>

	{#if blobUrl}
		<audio src={blobUrl} controls></audio>
	{/if}

	<input type="checkbox" bind:checked={isUsed} />
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px;
	}
</style>
