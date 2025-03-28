<script lang="ts">
	interface Props {
		seconds: number;
	}

	let { seconds }: Props = $props();

	function part(partValue: number) {
		return Math.floor(partValue).toString().padStart(2, '0');
	}

	let mm = $derived(part((seconds / 60) % 60));
	let ss = $derived(part(seconds % 60));
	let ds = $derived(part((seconds * 100) % 100));
</script>

<pre>{mm}:{ss}:{ds}</pre>

<style>
	pre {
		margin: 0;
	}
</style>
