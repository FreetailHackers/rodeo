import { writable } from 'svelte/store';

interface Notification {
	message: string;
	id: number;
}

function initToasts() {
	const array: Notification[] = []; // Must declare this typed array to satisfy TypeScript
	const timeouts: Record<number, NodeJS.Timeout> = {}; // Keep track of timeouts so we can cancel them if needed
	const { subscribe, update } = writable(array);

	return {
		subscribe,

		/**
		 * Create a new toast notification.
		 *
		 * @param message notification contents
		 * @returns ID which can be used to update the notification
		 */
		notify: (message: string) => {
			const notification = { message, id: Date.now() + Math.random() };
			update((toasts) => [...toasts, notification]);
			// Remove the toast after a short amount of time
			timeouts[notification.id] = setTimeout(() => {
				update((toasts) => toasts.filter((t) => t.id !== notification.id));
			}, 5000);
			return notification.id;
		},

		/**
		 * Update the contents of a notification.
		 *
		 * @param id ID of the notification to update
		 * @param message new notification contents
		 */
		update: (id: number, message: string) => {
			update((toasts) => {
				const index = toasts.findIndex((t) => t.id === id);
				if (index === -1) return toasts;
				toasts[index].message = message;
				// Reset timeout
				clearTimeout(timeouts[id]);
				timeouts[id] = setTimeout(() => {
					update((toasts) => toasts.filter((t) => t.id !== id));
				}, 5000);
				return toasts;
			});
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
