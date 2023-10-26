import type { Action } from 'svelte/action';

/**
 * This action (valid for <button type="submit">) will display a
 * confirmation dialog when it is clicked to submit its associated form.
 * If the user clicks OK, the form will be submitted. If the user clicks
 * Cancel, the form will not be submitted.
 *
 * If the user does not have JavaScript enabled, the form will be
 * submitted without a confirmation dialog.
 *
 * This action is compatible with use:enhance.
 */
export const confirmationDialog: Action<
	HTMLButtonElement,
	{
		text: string; // The text to display in the dialog
		cancel: string; // The text to display on the cancel button
		ok: string; // The text to display on the OK button
	}
> = (button, descriptions) => {
	button.addEventListener('click', (event) => {
		event.preventDefault();
		const dialog = document.createElement('dialog');
		// Remove the dialog when it closes to prevent memory leaks
		dialog.onclose = () => dialog.remove();
		// Create dialog text
		const p = document.createElement('p');
		p.innerText = descriptions?.text ?? 'Are you sure?';
		// Create dialog buttons
		const div = document.createElement('div');
		const cancel = document.createElement('button');
		cancel.innerText = descriptions?.cancel ?? 'Cancel';
		cancel.onclick = () => dialog.close();
		const ok = document.createElement('button');
		ok.innerText = descriptions?.ok ?? 'OK';
		ok.onclick = () => {
			button.form?.requestSubmit(button);
			dialog.close();
		};
		// Add dialog elements to the DOM
		div.appendChild(ok);
		div.appendChild(cancel);
		dialog.appendChild(p);
		dialog.appendChild(div);
		document.body.appendChild(dialog);
		dialog.showModal();
	});
};
