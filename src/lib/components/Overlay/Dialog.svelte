<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';

	import type { Snippet } from 'svelte';
	import IconButton from '../IconButton.svelte';
	import Modal from './Modal.svelte';

	interface Props {
		visible: boolean;

		title: string;
		children: Snippet;
	}

	let { visible = $bindable(), title, children }: Props = $props();

	function close() {
		visible = false;

		const focusedElement = document.activeElement;
		if (focusedElement instanceof HTMLElement) {
			focusedElement.blur();
		}
	}

	let headerId = $state(crypto.randomUUID());
</script>

<Modal {visible}>
	<div class="backdrop" class:visible aria-hidden={!visible}>
		<div class="dialog" role="dialog" aria-modal="true" aria-labelledby={headerId}>
			<div class="header">
				<h1 id={headerId}>{title}</h1>

				<IconButton icon={XIcon} onclick={close}>Close</IconButton>
			</div>
			<div class="body">
				{@render children()}
			</div>
		</div>
	</div>
</Modal>

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

		.dialog {
			transform: translateY(20px);
			transition: transform 0.5s;
		}

		&.visible {
			opacity: 1;
			pointer-events: all;

			.dialog {
				transform: translateY(0px);
			}
		}
	}

	.dialog {
		background-color: scheme.var-color('background');
		border: 1px solid scheme.var-color('primary');
		min-width: 400px;

		> div {
			padding: 16px 32px;
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
</style>
