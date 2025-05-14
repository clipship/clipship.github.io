<script lang="ts">
	interface Props {
		value: number;
		max: number;
		describeValue: (value: number) => string;

		background?: 'light' | 'dark';
		onchange?: (value: number) => void;

		/** Read-only. */
		isDragging?: boolean;
	}

	let {
		value = $bindable(),
		max,
		describeValue,
		background = 'light',
		onchange,
		isDragging: readOnlyIsDragging = $bindable(false)
	}: Props = $props();

	let dragStart = $state<{ rect: DOMRect }>();
	let isDragging = $derived(dragStart !== undefined);

	$effect(() => {
		readOnlyIsDragging = isDragging;
	});

	function inferValueFromMouse(ev: MouseEvent) {
		if (!dragStart) return;

		const x = ev.clientX - dragStart.rect.left;
		const progress = Math.min(Math.max(x / dragStart.rect.width, 0), 1);

		value = max * progress;
		onchange?.(value);
	}

	function onMouseDown(ev: MouseEvent) {
		ev.preventDefault();

		dragStart = {
			rect: (ev.target as HTMLElement).getBoundingClientRect()
		};

		inferValueFromMouse(ev);
	}
</script>

<svelte:window
	onmousemove={isDragging ? inferValueFromMouse : undefined}
	onmouseup={isDragging ? () => (dragStart = undefined) : undefined}
/>

<div
	class="progress"
	class:dark-background={background === 'dark'}
	class:dragging={isDragging}
	style:--progress={value / max}
	role="slider"
	tabindex={-1}
	aria-valuetext={describeValue(value)}
	aria-valuenow={value}
	aria-valuemin={0}
	aria-valuemax={max}
	onmousedown={onMouseDown}
>
	<div class="handle"></div>
</div>

<style lang="scss">
	@use '$lib/style/scheme';

	@function stop-gradient($stop-percentage, $color-before, $color-after) {
		@return linear-gradient(
			to right,
			$color-before $stop-percentage,
			$color-after $stop-percentage
		);
	}

	.progress {
		flex: 1;
		position: relative;
		cursor: pointer;
		display: flex;
		align-items: center;
		height: 4px;
		border-radius: 4px;
		background: stop-gradient(
			calc(var(--progress) * 100%),
			scheme.var-color('primary'),
			scheme.var-color('neutral')
		);

		&::after {
			content: '';
			position: absolute;
			padding: 12px 0;
			left: 0;
			width: 100%;
		}

		&:hover,
		&.dragging {
			.handle {
				opacity: 1;
			}
		}
	}

	.handle {
		pointer-events: none;
		position: absolute;
		left: calc(var(--progress) * 100%);
		transform: translateX(-50%);
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background-color: scheme.var-color('primary');

		opacity: 0;
		transition: opacity 0.15s;
	}
</style>
