<script lang="ts">
	interface Props {
		wavBuffer: ArrayBuffer;
		volume: number;
		muted: boolean;
		paused: boolean;
		referenceTime: number;
	}

	let { wavBuffer, volume, muted, paused, referenceTime }: Props = $props();

	let audioBlob = $derived(new Blob([wavBuffer]));
	let audioBlobUrl = $derived(URL.createObjectURL(audioBlob));

	let currentTime = $state(0);

	$effect(() => {
		currentTime = referenceTime;
	});
</script>

<audio src={audioBlobUrl} {volume} {muted} bind:paused bind:currentTime></audio>
