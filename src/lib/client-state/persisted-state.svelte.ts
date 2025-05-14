import { browser } from '$app/environment';

export class Persisted<T> {
	value = $state<T>() as T;

	constructor(key: string, fallback: T) {
		if (!browser) {
			this.value = fallback;
		} else {
			const storage = localStorage;
			const jsonValue = storage.getItem(key);

			if (jsonValue === null) {
				this.value = fallback;
			} else {
				this.value = JSON.parse(jsonValue);
			}

			$effect(() => {
				storage.setItem(key, JSON.stringify(this.value));
			});
		}
	}
}

export function persisted<T>(key: string, fallback: T): Persisted<T> {
	return new Persisted(key, fallback);
}
