<script lang="ts">
	import Tooltip from '$lib/components/Overlay/Tooltip.svelte';
	import Slider from '$lib/components/Slider.svelte';
	import ToggleButton from '$lib/components/ToggleButton.svelte';
	import HeadphoneOffIcon from '@lucide/svelte/icons/headphone-off';
	import HeadphonesIcon from '@lucide/svelte/icons/headphones';

	export interface TrackChannelProps {
		name: string;
		isUsed: boolean;
		volume: number;
	}

	let { name, isUsed = $bindable(), volume = $bindable() }: TrackChannelProps = $props();

	let isSliderDragged = $state(false);

	function toProgressString(value: number) {
		return `${Math.round(value * 100)}%`;
	}
</script>

<div class="channel">
	<div class="row">
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

	{#if isUsed}
		<Tooltip keepVisible={isSliderDragged}>
			{#snippet title()}
				Volume: {toProgressString(volume)}
			{/snippet}

			<Slider
				bind:value={volume}
				max={1.0}
				describeValue={(volume) => `${Math.round(volume * 100)}%`}
				bind:isDragging={isSliderDragged}
			/>
		</Tooltip>
	{/if}
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	.channel {
		padding: 8px 12px;
		display: grid;
		grid-template-rows: 1fr 1fr 1fr;
		align-items: center;
	}

	.row {
		margin-right: -4px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
