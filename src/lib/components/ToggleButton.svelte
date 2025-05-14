<script lang="ts">
	import type { Icon as IconType } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import IconButton, { type Color } from './IconButton.svelte';

	interface Props {
		icon: typeof IconType;
		color?: Color;
		variant?: 'outlined' | 'flat';
		disableMouseFocus?: boolean;

		value: boolean;
		children: Snippet;
	}

	let {
		icon,
		color,
		variant = 'outlined',
		disableMouseFocus,
		value = $bindable(),
		children
	}: Props = $props();
</script>

<IconButton
	{icon}
	{color}
	{disableMouseFocus}
	{variant}
	onclick={() => (value = !value)}
	disabled={value ? false : 'visual-only'}
	buttonProps={{
		role: 'switch',
		'aria-checked': value ? 'true' : 'false'
	}}
>
	{@render children()}
</IconButton>
