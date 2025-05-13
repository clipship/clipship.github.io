<script lang="ts" module>
	function part(partValue: number) {
		return Math.floor(partValue).toString().padStart(2, '0');
	}

	export function convertSecondsToDuration(seconds: number) {
		const ss = part(seconds % 60);

		const minutesTotal = Math.floor(seconds / 60);

		if (minutesTotal < 60) {
			return `${minutesTotal}:${ss}`;
		} else {
			const mm = part(minutesTotal % 60);
			const hoursTotal = Math.floor(minutesTotal / 60);

			return `${hoursTotal}:${mm}:${ss}`;
		}
	}
</script>

<script lang="ts">
	interface Props {
		seconds: number;
	}

	let { seconds }: Props = $props();

	let duration = $derived(convertSecondsToDuration(seconds));
</script>

{duration}
