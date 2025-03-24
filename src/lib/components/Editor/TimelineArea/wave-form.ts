const RIFF_HEADER_LENGTH = 44;
const INT_16_AMPLITUDE = 1 << 15;

export function createWavDataViewS16LE(wavBuffer: ArrayBuffer) {
	return new Int16Array(wavBuffer, RIFF_HEADER_LENGTH);
}

export type SampleArray = Int16Array;
export type MipMap = SampleArray[];

function generateMipMap(samples: SampleArray, levels: number): MipMap {
	const result: MipMap = [samples];

	let previousLevel = samples;
	for (let i = 0; i < levels; i++) {
		const downsampled = downsample(previousLevel);
		result.push(downsampled);

		previousLevel = downsampled;
	}

	return result;
}

function downsample(samples: SampleArray) {
	const halfLength = Math.ceil(samples.length / 2);
	const halfSamples = new Int16Array(halfLength);

	for (let i = 0; i < halfLength; i++) {
		const previousSample = samples[i * 2];
		const nextSample = samples[i * 2 + 1];

		if (Math.abs(previousSample) > Math.abs(nextSample)) {
			halfSamples[i] = previousSample;
		} else {
			halfSamples[i] = nextSample;
		}
	}

	return halfSamples;
}

function generateSampleBins(samples: SampleArray, binCount: number) {
	const sampleCount = samples.length;

	let binStart = 0;

	const result: number[] = [];

	for (let bin = 0; bin < binCount; bin++) {
		const binEndExclusive = Math.floor(sampleCount * ((bin + 1) / binCount));

		let max = Math.abs(samples[binStart]);

		for (let i = binStart + 1; i < binEndExclusive; i++) {
			const sample = samples[i];
			if (sample > max) {
				max = sample;
			} else if (-sample > max) {
				max = -sample;
			}
		}

		result.push(max / INT_16_AMPLITUDE);

		binStart = binEndExclusive;
	}

	return result;
}

export interface WaveFormRange {
	startFraction: number;
	endFraction: number;
}

export class WaveForm {
	private readonly mipMap: MipMap;

	constructor(samples: SampleArray, mipMapLevels: number) {
		this.mipMap = generateMipMap(samples, mipMapLevels);
	}

	collect(range: WaveFormRange, resolution: number) {
		const { startFraction, endFraction } = range;
		const smallestArray = this.getMipMapArray(resolution / (endFraction - startFraction));

		const offset = Math.floor(startFraction * smallestArray.byteLength);

		const arrayFraction = new Int16Array(
			smallestArray.buffer,
			// Int16Array must start at a multiple of 2
			Math.round(offset / 2) * 2,
			Math.floor((endFraction - startFraction) * smallestArray.length)
		);

		return generateSampleBins(arrayFraction, resolution);
	}

	private getMipMapArray(resolution: number) {
		for (let level = this.mipMap.length - 1; level > 0; level--) {
			const samples = this.mipMap[level];
			if (samples.length > resolution) {
				return samples;
			}
		}

		return this.mipMap[0];
	}
}
