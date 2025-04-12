<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';

	import type { Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import IconButton from '../IconButton.svelte';

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
</script>

{#if visible}
	<div class="backdrop" transition:fade={{ duration: 250 }}>
		<div
			class="dialog"
			role="dialog"
			aria-modal="true"
			transition:fly={{ duration: 500, y: 20, opacity: 1 }}
		>
			<div class="header">
				<h1>{title}</h1>

				<IconButton icon={XIcon} onclick={close}>Close</IconButton>
			</div>
			<div class="body">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	@use '$lib/style/scheme';

	.backdrop {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: #0005;

		display: grid;
		place-content: center;

		pointer-events: all;
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
