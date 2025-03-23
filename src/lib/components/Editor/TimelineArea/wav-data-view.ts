const RIFF_HEADER_LENGTH = 44;

export function createWAVDataViewS16LE(wavBuffer: ArrayBuffer) {
	return new Int16Array(wavBuffer, RIFF_HEADER_LENGTH);
}
