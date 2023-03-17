import { writable } from 'svelte/store';

function initToasts() {
	const array: string[] = []; // Must declare this typed array to satisfy TypeScript
	const { subscribe, update } = writable(array);

	return {
		subscribe,
		notify: (toast: string) => {
			update((toasts) => [...toasts, toast]);
			// Remove the toast after 3 seconds
			setTimeout(() => {
				update((toasts) => toasts.slice(1));
			}, 5000);
		},
	};
}
export const toasts = initToasts();
