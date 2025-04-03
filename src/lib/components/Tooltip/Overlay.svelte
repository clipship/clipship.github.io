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
		unmountPopover(popover: Popover): void;
	}

	export class PopoverState<TProps = any> {
		options: Popover;
		props = $state<TProps>();

		constructor(options: Popover, props?: TProps) {
			this.options = options;
			this.props = props;
		}
	}

	let globalPopovers = $state<PopoverState[]>([]);

	export const globalOverlay: OverlayContext = {
		mountPopover: <TProps,>(popover: Popover<TProps>, props?: TProps) => {
			const state = new PopoverState<TProps>(popover, props);

			globalPopovers.push(state);
			return state;
		},

		unmountPopover: (popover) =>
			(globalPopovers = globalPopovers.filter((item) => item.options !== popover))
	};
</script>

<div class="overlay">
	{#each globalPopovers as popover}
		{@const Popover = popover.options.component}
		{@const content = popover.options.content}
		{@const reference = popover.options.anchorElement.children.item(0) as HTMLElement}

		{@const popoverProps = popover.props}

		<PopoverBox {reference}>
			{#snippet popover()}
				<Popover {...popoverProps}>
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
