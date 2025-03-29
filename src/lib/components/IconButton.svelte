<script lang="ts">
	import type { Icon as IconType } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import Tooltip from './Tooltip.svelte';

	export type Color = 'primary' | 'secondary' | 'neutral';

	interface Props {
		icon: typeof IconType;
		stroke?: boolean;
		color?: Color;
		outline?: boolean;
		grayscale?: boolean;

		onclick: HTMLButtonElement['onclick'];
		children: Snippet;
	}

	let {
		icon: Icon,
		stroke = false,
		color = 'primary',
		outline = false,
		grayscale = false,
		onclick,
		children
	}: Props = $props();
</script>

<Tooltip>
	<button data-color={color} {onclick} class:outline class:grayscale>
		<Icon fill={stroke ? 'transparent' : 'currentColor'} />
	</button>

	{#snippet tooltip()}
		{@render children()}
	{/snippet}
</Tooltip>

<style lang="scss">
	@use '$lib/style/components';
	@use '$lib/style/scheme';

	@mixin reactive-color($color) {
		&:not(.outline) {
			background-color: scheme.var-color($color);

			&:hover,
			&:focus-visible,
			&:active {
				background-color: scheme.var-color($color, 1);
			}
		}

		&.outline {
			background-color: scheme.var-color($color, -2);
			color: scheme.var-color($color);
			border: 2px solid currentColor;

			&:hover,
			&:focus-visible,
			&:active {
				color: scheme.var-color($color, 1);
			}
		}
	}

	button {
		@include components.transitions-snappy();

		display: grid;
		place-content: center;
		color: scheme.var-color('text');
		border: none;
		border-radius: 8px;
		width: 52px;
		height: 40px;
		cursor: pointer;

		&:active {
			scale: 0.9;
		}

		&:disabled,
		&.grayscale {
			filter: grayscale(1);
		}

		@include reactive-color('primary');

		&[data-color='secondary'] {
			@include reactive-color('secondary');
		}

		&[data-color='neutral'] {
			@include reactive-color('neutral');
		}
	}
</style>
