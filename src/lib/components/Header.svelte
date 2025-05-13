<script lang="ts">
	import GithubIcon from '@lucide/svelte/icons/github';
	import Tooltip from './Overlay/Tooltip.svelte';
</script>

<header>
	<h1>clipship</h1>
	<p>web clip editor</p>

	<div class="trailing">
		<Tooltip alignment="bottom-center">
			{#snippet title()}
				GitHub
			{/snippet}

			<a href="https://github.com/doodlezucc/clipship">
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
