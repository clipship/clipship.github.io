<script lang="ts">
	export interface TrackChannelProps {
		name: string;
		isUsed: boolean;
	}

	let { name, isUsed = $bindable() }: TrackChannelProps = $props();
</script>

<div>
	<span>{name}</span>

	<input type="checkbox" bind:checked={isUsed} />
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		outline: 1px solid scheme.var-color('primary');
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px;
	}
</style>
