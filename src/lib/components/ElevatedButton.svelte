<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export type Color = 'primary' | 'secondary' | 'neutral';

	interface Props {
		color?: Color;
		outline?: boolean;

		disableMouseFocus?: boolean;
		onclick: (ev: MouseEvent) => void;
		children: Snippet;

		buttonProps?: Omit<HTMLButtonAttributes, 'children' | 'onclick'>;
	}

	let {
		buttonProps,
		color = 'primary',
		disableMouseFocus = false,
		onclick,
		children
	}: Props = $props();

	function preventFocusOnMouseDown(ev: MouseEvent) {
		ev.preventDefault();
	}
</script>

<button
	{...buttonProps}
	data-color={color}
	{onclick}
	onmousedown={disableMouseFocus ? preventFocusOnMouseDown : undefined}
>
	{@render children()}
</button>

<style lang="scss">
	@use '$lib/style/components';

	button {
		@extend %button;
	}
</style>
