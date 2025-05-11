<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		headline: string;
		disabled?: boolean;
		children: Snippet;
		trailing: Snippet;
	}

	let { headline, disabled = false, children, trailing }: Props = $props();
</script>

<div class="setting" inert={disabled}>
	<div class="description">
		<span>{headline}</span>
		<span class="supporting">{@render children()}</span>
	</div>

	<div class="trailing">
		{@render trailing()}
	</div>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	.setting {
		display: grid;
		grid-template-columns: 1fr max-content;
		gap: 48px;
		align-items: center;

		&[inert] {
			opacity: 0.5;
		}
	}

	.description {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.supporting {
		opacity: 0.65;
	}
</style>
