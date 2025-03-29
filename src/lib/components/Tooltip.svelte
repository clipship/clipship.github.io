<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tooltip: Snippet;
		children: Snippet;
	}

	let { tooltip, children }: Props = $props();
</script>

<div class="has-tooltip">
	<div role="tooltip">
		{@render tooltip()}
	</div>

	{@render children()}
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	%show-tooltip {
		:global([role='tooltip']) {
			opacity: 1;
			translate: 0 0;
		}
	}

	.has-tooltip {
		display: grid;
		align-items: center;
		justify-items: center;
		position: relative;

		&:hover:not(:active) {
			@extend %show-tooltip;
		}
	}

	:global(.has-tooltip:has(:focus-visible)) {
		@extend %show-tooltip;
	}

	[role='tooltip'] {
		z-index: 1;
		pointer-events: none;

		position: absolute;
		bottom: 100%;
		margin: 6px;

		opacity: 0;
		translate: 0 4px;
		transition: 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);

		background-color: scheme.var-color('primary');
		border: none;
		border-radius: 8px;
		padding: 8px;
		font-size: 0.8rem;
		text-align: center;
		width: max-content;
		max-width: 200px;

		box-shadow: 2px 2px 0 #0005;
	}
</style>
