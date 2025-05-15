<script lang="ts">
	interface Props {
		progress?: number;
	}

	let { progress }: Props = $props();
</script>

{#if !progress}
	<p>Initializing...</p>
{:else}
	<p>Progress: {(progress * 100).toFixed(1)}%</p>
{/if}

<style lang="scss">
	p {
		text-align: center;
	}
</style>
