<script lang="ts">
	import { type Snippet } from 'svelte';
	import { BaseTetherTooltip, type Alignment } from 'svelte-tether';

	interface Props {
		keepVisible?: boolean;
		alignment?: Alignment;
		children: Snippet;
		title: Snippet;
	}

	let { keepVisible = false, alignment = 'top-center', children, title }: Props = $props();
</script>

<BaseTetherTooltip origin={alignment}>
	{@render children()}

	{#snippet tooltip({ tooltipId, isFocused, isHovered })}
		<div
			id={tooltipId}
			class:show={keepVisible || isFocused || isHovered}
			aria-hidden="true"
			role="tooltip"
		>
			{@render title()}
		</div>
	{/snippet}
</BaseTetherTooltip>

<style lang="scss">
	@use '$lib/style/scheme';

	[role='tooltip'] {
		background-color: scheme.var-color('neutral', -1);
		border: none;
		border-radius: 4px;
		padding: 8px 12px;
		font-size: 0.85rem;
		text-align: center;
		width: max-content;
		max-width: 200px;
		box-shadow: 0 2px 6px #000a;

		transition: 0.15s cubic-bezier(0.165, 0.84, 0.44, 1);
		opacity: 0;
		margin: 0 6px;

		&.show {
			opacity: 1;
			margin: 6px;
		}
	}
</style>
