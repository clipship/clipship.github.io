<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';

	import type { Snippet } from 'svelte';
	import { Portal } from 'svelte-tether';
	import IconButton from '../IconButton.svelte';

	interface Props {
		visible: boolean;
		disableCloseButton?: boolean;

		title: string;
		children: Snippet;
		actions?: Snippet;
	}

	let {
		visible = $bindable(),
		disableCloseButton = false,
		title,
		children,
		actions
	}: Props = $props();

	function close() {
		visible = false;

		const focusedElement = document.activeElement;
		if (focusedElement instanceof HTMLElement) {
			focusedElement.blur();
		}
	}

	let headerId = $state(crypto.randomUUID());
</script>

<Portal modal={visible}>
	<div class="backdrop" class:visible aria-hidden={!visible}>
		<div role="dialog" aria-modal="true" aria-labelledby={headerId}>
			<div class="header">
				<h1 id={headerId}>{title}</h1>

				{#if !disableCloseButton}
					<IconButton icon={XIcon} onclick={close} variant="flat" buttonProps={{ tabindex: 0 }}>
						Close
					</IconButton>
				{/if}
			</div>

			<div class="body">
				{@render children()}
			</div>

			{#if actions}
				<div class="actions">
					{@render actions()}
				</div>
			{/if}
		</div>
	</div>
</Portal>

<style lang="scss">
	@use '$lib/style/scheme';

	.backdrop {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: #0005;

		display: grid;
		place-content: center;

		opacity: 0;
		pointer-events: none;
		transition: opacity 0.5s;

		[role='dialog'] {
			transform: translateY(20px);
			transition: transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
		}

		&.visible {
			opacity: 1;
			pointer-events: all;

			[role='dialog'] {
				transform: translateY(0px);
			}
		}
	}

	[role='dialog'] {
		background-color: scheme.var-color('background');
		border: 1px solid scheme.var-color('primary');
		box-shadow: 0 8px 32px #000a;
		min-width: 40vw;
		width: 640px;
		max-width: calc(100vw - 32px);

		> div {
			padding: 16px 24px;
		}
	}

	.header {
		border-bottom: 1px solid scheme.var-color('neutral');
		display: grid;
		align-items: center;
		grid-template-columns: auto max-content;
	}

	h1 {
		margin: 0;
		font-size: 1.5em;
	}

	div.body {
		padding: 32px 48px;
	}

	div.actions {
		display: flex;
		align-items: center;
		justify-content: end;
		padding-top: 0;
		padding-bottom: 24px;
	}
</style>
