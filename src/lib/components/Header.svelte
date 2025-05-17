<script lang="ts">
	import { base } from '$app/paths';
	import GithubIcon from '@lucide/svelte/icons/github';
	import Tooltip from './Overlay/Tooltip.svelte';
</script>

<header>
	<div class="logo">
		<img src="{base}/favicon.svg" alt="Icon" />
		<h1>clipship</h1>
	</div>
	<p>web clip editor</p>

	<div class="trailing">
		<Tooltip alignment="bottom-center">
			{#snippet title()}
				GitHub
			{/snippet}

			<a href="https://github.com/clipship/clipship.github.io">
				<GithubIcon aria-hidden />
			</a>
		</Tooltip>
	</div>
</header>

<style lang="scss">
	@use '$lib/style/scheme';

	header {
		position: sticky;
		left: 0;
		right: 0;
		top: 0;
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 12px 32px;
		padding-left: 24px;
		backdrop-filter: blur(3px);

		&::before {
			content: '';
			position: absolute;
			z-index: -1;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			background-color: scheme.var-color('background');
			opacity: 0.5;
		}
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	img {
		height: 32px;
		margin-top: -2px;
	}

	h1 {
		margin: 0;
		font-size: 1.8em;
	}

	p {
		margin: 0;
	}

	a {
		display: inline-flex;
		color: inherit;
	}

	.trailing {
		margin-left: auto;
		display: flex;
		gap: 8px;
	}
</style>
