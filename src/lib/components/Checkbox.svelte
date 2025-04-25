<script lang="ts">
	import SquareIcon from '@lucide/svelte/icons/square';
	import SquareCheckIcon from '@lucide/svelte/icons/square-check';

	interface Props {
		checked: boolean;
	}

	let { checked = $bindable() }: Props = $props();
</script>

<label>
	<input type="checkbox" bind:checked />

	{#if !checked}
		<SquareIcon size={28} />
	{:else}
		<SquareCheckIcon size={28} />
	{/if}
</label>

<style lang="scss">
	@use '$lib/style/components';
	@use '$lib/style/scheme';

	label {
		@extend %flat-icon-button;

		color: scheme.var-color('neutral', 1);

		&:has(:focus-visible) {
			@include components.area(#aaa3);
		}

		&:has(:checked) {
			color: scheme.var-color('primary');

			:global(*) {
				fill: scheme.var-color('primary', -2);
			}
		}
	}

	input {
		appearance: none;
		margin: 0;
	}
</style>
