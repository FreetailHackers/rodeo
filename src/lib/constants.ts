export const IDENTITY_QUESTION = {
	id: '__identity__',
	label: 'Which of the following best identifies with you?',
	type: 'RADIO' as const,
	required: true,
	options: ['UT Student', 'In-State Texas Student', 'OOS Student'],
	targetGroup: [] as string[],
};
