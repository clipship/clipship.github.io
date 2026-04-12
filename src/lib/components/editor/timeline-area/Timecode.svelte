<script lang="ts" module>
	function part(partValue: number) {
		return Math.floor(partValue).toString().padStart(2, '0');
	}

	export function convertSecondsToTimecode(seconds: number) {
		const mm = part((seconds / 60) % 60);
		const ss = part(seconds % 60);
		const cs = part((seconds * 100) % 100);

		return `${mm}:${ss}.${cs}`;
	}
</script>

<script lang="ts">
	interface Props {
		seconds: number;
	}

	let { seconds }: Props = $props();

	let timecode = $derived(convertSecondsToTimecode(seconds));
</script>

<pre>{timecode}</pre>

<style>
	pre {
		margin: 0;
	}
</style>
