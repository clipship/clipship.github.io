<script lang="ts">
	interface Props {
		wavBuffer: ArrayBuffer;
		volume: number;
		muted: boolean;
		paused: boolean;
		unpauseOnEnd: boolean;
		referenceTime: number;
	}

	let { wavBuffer, volume, muted, paused, unpauseOnEnd, referenceTime }: Props = $props();

	let audioBlob = $derived(new Blob([wavBuffer]));
	let audioBlobUrl = $derived(URL.createObjectURL(audioBlob));

	let currentTime = $derived(referenceTime);
</script>

<audio
	src={audioBlobUrl}
	{volume}
	{muted}
	bind:paused
	bind:currentTime
	onended={() => {
		if (unpauseOnEnd) {
			paused = false;
		}
	}}
></audio>
