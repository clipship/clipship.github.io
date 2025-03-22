<script>
	import ContentPadding from './ContentPadding.svelte';
</script>

<header>
	<ContentPadding>
		<p>do thing</p>
	</ContentPadding>
</header>

<style lang="scss">
	@use '$lib/style/scheme';

	header {
		position: sticky;
		left: 0;
		right: 0;
		top: 0;
		display: flex;
		justify-content: end;
		padding: 4px 0;
		backdrop-filter: blur(3px);

		::before {
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
</style>
