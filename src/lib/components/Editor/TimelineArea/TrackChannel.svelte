<script lang="ts">
	export interface TrackChannelProps {
		name: string;
		isUsed: boolean;
		audioBuffer?: ArrayBuffer;
	}

	let { name, isUsed = $bindable(), audioBuffer }: TrackChannelProps = $props();

	let blobUrl = $derived(audioBuffer ? URL.createObjectURL(new Blob([audioBuffer])) : undefined);
</script>

<div>
	<span>{name}</span>

	<!-- {#if blobUrl}
		<audio src={blobUrl} controls></audio>
	{/if} -->

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
