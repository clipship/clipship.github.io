<script lang="ts">
	import type { Icon as IconType } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import IconButton from './IconButton.svelte';

	interface Props {
		icon: typeof IconType;
		stroke?: boolean;

		value: boolean;
		children: Snippet;
	}

	let { icon, stroke = false, value = $bindable(), children }: Props = $props();
</script>

<IconButton
	{icon}
	{stroke}
	outline
	onclick={() => (value = !value)}
	color="primary"
	grayscale={!value}
>
	{@render children()}
</IconButton>
