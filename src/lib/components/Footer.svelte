<script>
	import ContentPadding from './ContentPadding.svelte';
</script>

<footer>
	<ContentPadding>
		<p>by doodlezucc</p>
	</ContentPadding>
</footer>

<style lang="scss">
	@use '$lib/style/scheme';

	footer {
		margin-top: 64px;
		padding: 32px 0;
		background-color: scheme.var-color('background');
		border-top: 1px solid scheme.var-color('text');
	}
</style>
