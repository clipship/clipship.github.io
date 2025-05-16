import { untrack } from 'svelte';

const DEFAULT_WINDOW_TITLE = 'Clipship Editor';

class PageState {
	private readonly windowTitleStack = $state<string[]>([]);
	readonly windowTitle = $derived(this.windowTitleStack.at(-1) ?? DEFAULT_WINDOW_TITLE);

	useTitleWhileMounted(createTitle: () => string) {
		$effect(() => {
			const title = createTitle();

			return untrack(() => {
				this.windowTitleStack.push(title);

				return () => {
					this.windowTitleStack.splice(this.windowTitleStack.indexOf(title), 1);
				};
			});
		});
	}
}

export const pageState = new PageState();
