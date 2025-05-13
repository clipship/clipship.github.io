<script lang="ts">
	interface Props {
		progress: number;
	}

	let { progress }: Props = $props();
</script>

<p>Progress: {(progress * 100).toFixed(1)}%</p>

<style lang="scss">
	p {
		text-align: center;
	}
</style>
