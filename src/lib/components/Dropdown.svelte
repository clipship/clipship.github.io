<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { Tether } from 'svelte-tether';

	interface Props {
		options: string[];
		value: string;
	}

	let { options, value = $bindable() }: Props = $props();

	let expanded = $state(false);
	let popupId = $props.id();

	function onSelect(option: string) {
		value = option;
		expanded = false;
	}

	function onOptionKeyDown(option: string, ev: KeyboardEvent) {
		if (ev.key === ' ' || ev.key === 'Enter') {
			ev.preventDefault();
			onSelect(option);
		}
	}

	function onDropdownKeyDown(ev: KeyboardEvent) {
		if (ev.key === 'Escape') {
			ev.preventDefault();
			expanded = false;
		} else if (ev.key === ' ' || ev.key === 'Enter') {
			ev.preventDefault();
			expanded = !expanded;
		} else if (ev.key === 'ArrowUp') {
			ev.preventDefault();
			value = options[(options.indexOf(value) + options.length - 1) % options.length];
		} else if (ev.key === 'ArrowDown') {
			ev.preventDefault();
			value = options[(options.indexOf(value) + 1) % options.length];
		}
	}
</script>

<svelte:window onmouseup={expanded ? () => (expanded = false) : undefined} />

<Tether origin="bottom-center" inheritWidth wrapVertical>
	{#snippet children({ isMirroredVertically })}
		<div
			class:wrap-to-top={isMirroredVertically}
			role="combobox"
			aria-controls={popupId}
			aria-expanded={expanded}
			tabindex="0"
			onclick={() => (expanded = true)}
			onkeydown={onDropdownKeyDown}
		>
			<span>{value}</span>

			<div class="icon">
				<ChevronDownIcon />
			</div>
		</div>
	{/snippet}

	{#snippet portal({ isMirroredVertically })}
		<ul
			class:wrap-to-top={isMirroredVertically}
			aria-hidden={!expanded}
			role="listbox"
			id={popupId}
		>
			{#each options as option (option)}
				<li
					role="option"
					aria-selected={value === option}
					tabindex="0"
					onmousedown={() => onSelect(option)}
					onkeydown={(ev) => onOptionKeyDown(option, ev)}
				>
					{option}
				</li>
			{/each}
		</ul>
	{/snippet}
</Tether>

<style lang="scss">
	@use '$lib/style/components';
	@use '$lib/style/scheme';

	[role='combobox'] {
		@include components.transitions-snappy();

		appearance: none;
		font: inherit;
		padding: 10px 12px;
		border: none;
		border-radius: 8px;
		color: inherit;
		cursor: pointer;
		background: none;
		min-width: 120px;

		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;

		display: grid;
		grid-template-columns: 1fr max-content;
		transition: 0.2s;

		&:hover,
		&:focus-visible,
		&[aria-expanded='true'] {
			background: scheme.var-color('neutral', -1);
		}

		.icon {
			display: inline-flex;
			align-items: center;
			transition: rotate 0.2s;
		}

		&[aria-expanded='true'] {
			&:not(.wrap-to-top) {
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;
			}

			&.wrap-to-top {
				border-top-left-radius: 0;
				border-top-right-radius: 0;
			}

			.icon {
				rotate: 180deg;
			}
		}
	}

	[role='listbox'] {
		margin: 0;
		padding-inline-start: 0;
		pointer-events: all;
		background: scheme.var-color('neutral', -2);
		border: 1px solid scheme.var-color('neutral', -1);
		border-radius: 8px;
		max-height: 200px;
		overflow: auto;

		transition: 0.1s;

		&[aria-hidden='true'] {
			pointer-events: none;
			opacity: 0;
		}

		&:not(.wrap-to-top) {
			border-top-width: 0;
			border-top-left-radius: 0;
			border-top-right-radius: 0;
		}

		&.wrap-to-top {
			border-bottom-width: 0;
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
		}
	}

	[role='option'] {
		list-style: none;
		padding: 6px 16px;
		cursor: pointer;

		&:hover {
			background-color: scheme.var-color('neutral', -1);
		}

		&[aria-selected='true'] {
			color: scheme.var-color('primary');
			font-weight: 600;
		}
	}
</style>
