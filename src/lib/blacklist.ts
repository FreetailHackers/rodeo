import type { Settings } from '@prisma/client';

/**
 * Normalize a string into a safe comparable form.
 * - NFKD decomposes characters into their canonical forms.
 * - Removes diacritical marks (accents, tildes, etc.).
 * - Trims whitespace and lowercases the string.
 */
export const normalizeString = (value: string) =>
	value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.toLowerCase();

/**
 * Normalize only whitespace for names
 */
const normalizeNameWhitespace = (s: string) => s.trim();

/**
 * Check whether two names are likely the same person
 */
export function nameLikelyMatches(candidateName: string, blacklistName: string) {
	const candidateParts = normalizeNameWhitespace(candidateName)
		.toLowerCase()
		.split(/\s+/)
		.filter(Boolean);
	const blacklistParts = normalizeNameWhitespace(blacklistName)
		.toLowerCase()
		.split(/\s+/)
		.filter(Boolean);
	if (!candidateParts.length || !blacklistParts.length) return false;
	if (candidateParts.join(' ') === blacklistParts.join(' ')) return true;
	const [candidateFirst, candidateLast] = [
		candidateParts[0],
		candidateParts[candidateParts.length - 1],
	];
	const [blacklistFirst, blacklistLast] = [
		blacklistParts[0],
		blacklistParts[blacklistParts.length - 1],
	];
	return (
		(candidateFirst === blacklistFirst && candidateLast === blacklistLast) ||
		(candidateParts.includes(blacklistFirst) && candidateParts.includes(blacklistLast))
	);
}

/**
 * Check whether a given email, name, or form answers match
 * any blacklisted entries configured in system settings.
 */

export function checkBlacklist(
	email: string | undefined,
	fullName: string | undefined,
	answersJoined: string | undefined,
	settings: Pick<Settings, 'blacklistEmails' | 'blacklistNames'>,
) {
	const normalizedAnswers = normalizeString(answersJoined || '');
	const normalizedEmail = normalizeString(email || '');
	const nameToCheck = fullName || '';

	//check email against blacklist
	const emailMatch =
		settings.blacklistEmails?.some((blacklistedEmail) => blacklistedEmail === normalizedEmail) ||
		settings.blacklistEmails?.some(
			(blacklistedEmail) => blacklistedEmail && normalizedAnswers.includes(blacklistedEmail),
		);

	//check name against blacklist
	const nameMatch =
		(nameToCheck &&
			settings.blacklistNames?.some((blacklistName) =>
				nameLikelyMatches(nameToCheck, blacklistName),
			)) ||
		settings.blacklistNames?.some((blacklistedName) => {
			const normalizedBlacklistName = normalizeString(blacklistedName);
			return (
				normalizedBlacklistName &&
				new RegExp(`\\b${normalizedBlacklistName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(
					normalizedAnswers,
				)
			);
		});

	return emailMatch || nameMatch;
}
