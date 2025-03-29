<script lang="ts">
	import type { Icon as IconType } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import Tooltip from './Tooltip.svelte';

	type Color = 'primary' | 'secondary';

	interface Props {
		icon: typeof IconType;
		stroke?: boolean;
		color?: Color;

		onclick: HTMLButtonElement['onclick'];
		children: Snippet;
	}

	let { icon: Icon, stroke = false, color = 'primary', onclick, children }: Props = $props();
</script>

<Tooltip>
	<button data-color={color} {onclick}>
		<Icon fill={stroke ? undefined : 'currentColor'} />
	</button>

	{#snippet tooltip()}
		{@render children()}
	{/snippet}
</Tooltip>

<style lang="scss">
	@use '$lib/style/components';
	@use '$lib/style/scheme';

	button {
		@include components.transitions-snappy();

		display: flex;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 8px;
		background-color: scheme.var-color('primary');
		cursor: pointer;

		&:hover {
			background-color: scheme.var-color('primary', 1);
		}

		&:active {
			scale: 0.9;
		}

		&[data-color='secondary'] {
			background-color: scheme.var-color('secondary');
		}
	}
</style>
