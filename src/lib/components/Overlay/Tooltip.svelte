<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		visible: boolean;
		children: Snippet;
	}

	let { visible, children }: Props = $props();
</script>

<div aria-hidden="true" class:visible>
	{@render children()}
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	div {
		margin: 6px;
		opacity: 0;
		translate: 0 4px;
		transition: 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);

		background-color: scheme.var-color('neutral');
		border: none;
		border-radius: 8px;
		padding: 10px 16px;
		font-size: 0.8rem;
		text-align: center;
		width: max-content;
		max-width: 200px;

		box-shadow: 0 2px 6px #000a;

		&.visible {
			opacity: 1;
			translate: 0 0;
		}
	}
</style>
