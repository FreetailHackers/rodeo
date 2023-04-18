import { writable } from 'svelte/store';

interface Notification {
	message: string;
	timestamp: number;
}

function initToasts() {
	const array: Notification[] = []; // Must declare this typed array to satisfy TypeScript
	const { subscribe, update } = writable(array);

	return {
		subscribe,
		notify: (message: string) => {
			update((toasts) => [...toasts, { message, timestamp: Date.now() }]);
			// Remove the toast after a short amount of time
			setTimeout(() => {
				update((toasts) => toasts.slice(1));
			}, 5000);
		},
	};
}

/**
 * This store provides an easy-to-use interface for displaying toast or
 * popup notifications that dismiss themselves automatically from
 * anywhere in the app. To use, simply import it like so:
 *
 * `import { toasts } from '$lib/stores';`
 *
 * and then call `toasts.notify('Hello, world!')` to display a toast.
 */
export const toasts = initToasts();
