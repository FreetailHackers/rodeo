// src/lib/blacklist.ts
import type { Settings } from '@prisma/client';

export const norm = (s: string) =>
	s
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.toLowerCase();
const normName = (s: string) => s.trim();

export function nameLikelyMatches(candidate: string, watch: string) {
	const a = normName(candidate).toLowerCase().split(/\s+/).filter(Boolean);
	const b = normName(watch).toLowerCase().split(/\s+/).filter(Boolean);
	if (!a.length || !b.length) return false;
	if (a.join(' ') === b.join(' ')) return true;
	const [af, al] = [a[0], a[a.length - 1]];
	const [bf, bl] = [b[0], b[b.length - 1]];
	return (af === bf && al === bl) || (a.includes(bf) && a.includes(bl));
}

export function checkWatchlist(
	email: string | undefined,
	fullName: string | undefined,
	answersJoined: string | undefined,
	settings: Pick<Settings, 'blacklistEmails' | 'blacklistNames'>,
) {
	const answers = norm(answersJoined || '');
	const ne = norm(email || '');
	const name = fullName || '';

	const emailHit =
		settings.blacklistEmails?.some((e) => e === ne) ||
		settings.blacklistEmails?.some((e) => e && answers.includes(e));

	const nameHit =
		(!!name && settings.blacklistNames?.some((w) => nameLikelyMatches(name, w))) ||
		settings.blacklistNames?.some((w) => {
			const wNorm = norm(w);
			return (
				wNorm && new RegExp(`\\b${wNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(answers)
			);
		});

	return !!(emailHit || nameHit);
}
