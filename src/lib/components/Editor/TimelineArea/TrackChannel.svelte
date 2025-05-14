<script lang="ts">
	import ToggleButton from '$lib/components/ToggleButton.svelte';
	import HeadphoneOffIcon from '@lucide/svelte/icons/headphone-off';
	import HeadphonesIcon from '@lucide/svelte/icons/headphones';

	export interface TrackChannelProps {
		name: string;
		isUsed: boolean;
	}

	let { name, isUsed = $bindable() }: TrackChannelProps = $props();
</script>

<div>
	<span>{name}</span>

	<ToggleButton
		icon={isUsed ? HeadphonesIcon : HeadphoneOffIcon}
		variant="flat"
		disableMouseFocus
		bind:value={isUsed}
	>
		{#if isUsed}
			Disable Track
		{:else}
			Enable Track
		{/if}
	</ToggleButton>
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
