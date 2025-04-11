<script lang="ts" module>
	import { type Component, type Snippet } from 'svelte';
	import PopoverBox from './PopoverBox.svelte';

	type BaseProps = { children: Snippet };

	export interface Popover<TProps = any> {
		anchorElement: HTMLElement;
		component: Component<TProps & BaseProps>;
		content: Snippet;
	}

	export interface OverlayContext {
		mountPopover<TProps>(popover: Popover<TProps>, props?: TProps): PopoverState<TProps>;
	}

	export class PopoverState<TProps = any> {
		options: Popover;
		props = $state<TProps>();
		renderedText = $state<string>();

		unmount: () => void;

		constructor(unmount: () => void, options: Popover, props?: TProps) {
			this.options = options;
			this.props = props;
			this.unmount = unmount;
		}
	}

	let globalPopovers = $state<PopoverState[]>([]);

	export const globalOverlay: OverlayContext = {
		mountPopover: <TProps,>(popover: Popover<TProps>, props?: TProps) => {
			const state = new PopoverState<TProps>(
				() => {
					globalPopovers = globalPopovers.filter((someState) => someState !== state);
				},
				popover,
				props
			);

			globalPopovers.push(state);
			return state;
		}
	};
</script>

<div class="overlay">
	{#each globalPopovers as popoverState}
		{@const Popover = popoverState.options.component}
		{@const content = popoverState.options.content}
		{@const reference = popoverState.options.anchorElement.children.item(0) as HTMLElement}

		<PopoverBox {reference} bind:renderedText={popoverState.renderedText}>
			{#snippet popover()}
				<Popover {...popoverState.props}>
					{@render content()}
				</Popover>
			{/snippet}
		</PopoverBox>
	{/each}
</div>

<style lang="scss">
	.overlay {
		position: absolute;
		z-index: 999;
		pointer-events: none;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
