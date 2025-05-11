<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props {
		active: boolean;

		onclick: (ev: MouseEvent) => void;
		children: Snippet;

		buttonProps?: Omit<HTMLButtonAttributes, 'children' | 'disabled' | 'onclick'>;
	}

	let { buttonProps, active, onclick, children }: Props = $props();
</script>

<button {...buttonProps} {onclick} class:active>
	{@render children()}
</button>

<style lang="scss">
	@use '$lib/style/components';
	@use '$lib/style/scheme';

	button {
		@include components.transitions-snappy();

		display: grid;
		place-content: center;
		color: scheme.var-color('text');
		font: inherit;
		outline: none;
		border: 2px solid transparent;
		border-radius: 100vw;
		padding: 8px 12px;
		cursor: pointer;

		background-color: scheme.var-color('primary', -1);

		&:not(.active) {
			filter: grayscale(0.2) brightness(75%);
		}

		&.active {
			border-color: scheme.var-color('primary', 2);
			font-weight: bold;
		}

		&:hover,
		&:focus-visible,
		&:active {
			border-color: scheme.var-color('primary', 2);
			background-color: scheme.var-color('primary');
		}

		&:active {
			scale: 0.95;
		}
	}
</style>
