<script lang="ts">
	import type { Icon as IconType } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Tooltip from './Overlay/Tooltip.svelte';

	export type Color = 'primary' | 'secondary' | 'neutral';
	export type Variant = 'filled' | 'outlined' | 'flat';

	interface Props {
		icon: typeof IconType;
		stroke?: boolean;
		color?: Color;
		variant?: Variant;
		disabled?: boolean | 'visual-only';

		disableMouseFocus?: boolean;
		onclick: (ev: MouseEvent) => void;
		children: Snippet;

		buttonProps?: Omit<HTMLButtonAttributes, 'children' | 'disabled' | 'onclick'>;
	}

	let {
		buttonProps,
		icon: Icon,
		stroke = false,
		color = 'primary',
		variant = 'filled',
		disabled = false,
		disableMouseFocus = false,
		onclick,
		children
	}: Props = $props();

	function preventFocusOnMouseDown(ev: MouseEvent) {
		ev.preventDefault();
	}
</script>

<Tooltip>
	<button
		{...buttonProps}
		data-variant={variant}
		data-color={color}
		{onclick}
		onmousedown={disableMouseFocus ? preventFocusOnMouseDown : undefined}
		disabled={disabled === true}
		class:visual-disabled={disabled === 'visual-only'}
	>
		<Icon fill={stroke ? 'transparent' : 'currentColor'} aria-hidden />
	</button>

	{#snippet title()}
		{@render children()}
	{/snippet}
</Tooltip>

<style lang="scss">
	@use '$lib/style/components';
	@use '$lib/style/scheme';

	@mixin reactive-color($color) {
		&[data-variant='filled'] {
			background-color: scheme.var-color($color);

			&:hover,
			&:focus-visible,
			&:active {
				background-color: scheme.var-color($color, 1);
			}

			&:active {
				scale: 0.9;
			}
		}

		&[data-variant='outlined'] {
			background-color: scheme.var-color($color, -2);
			color: scheme.var-color($color);
			border: 2px solid currentColor;

			&:hover,
			&:focus-visible,
			&:active {
				color: scheme.var-color($color, 1);
			}

			&:active {
				scale: 0.9;
			}
		}

		&[data-variant='flat'] {
			@extend %flat-icon-button;

			padding: 0;
			color: scheme.var-color($color);
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

		&:disabled,
		&.visual-disabled {
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
