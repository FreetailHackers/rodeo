import { describe, it, expect, vi } from 'vitest';
import { trpcTest } from '../router';
import prisma from '$lib/trpc/__mocks__/db';
import type { Question, Settings, User } from '@prisma/client';
import { hash } from '$lib/hash';

vi.mock('$lib/trpc/db');

const sampleHacker: User = {
	id: 1,
	email: 'hacker@yopmail.com',
	magicLink: hash('hacker'),
	role: 'HACKER',
	status: 'CREATED',
	application: {},
	scanCount: {},
};

const sampleAdmin: User = {
	id: 2,
	email: 'admin@yopmail.com',
	magicLink: hash('admin'),
	role: 'ADMIN',
	status: 'CREATED',
	application: {},
	scanCount: {},
};

const sampleSettings: Settings = {
	id: 0,
	applicationOpen: true,
	confirmBy: new Date('1970-01-01'),
	info: '',
	homepageText: '',
	rollingAdmissions: false,
	submitTemplate: '',
	acceptTemplate: '',
	rejectTemplate: '',
	waitlistTemplate: '',
	confirmTemplate: '',
	declineTemplate: '',
	scanActions: [],
};

const sampleQuestions: Question[] = [
	{
		id: 'name',
		label: 'Name',
		type: 'SENTENCE',
		required: true,
		order: 0,
		placeholder: 'J. Random Hacker',
		options: [],
		min: null,
		max: null,
		step: null,
		regex: '',
	},
	{
		id: 'classification',
		label: 'Classification',
		type: 'DROPDOWN',
		required: true,
		order: 1,
		placeholder: '',
		options: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
		min: null,
		max: null,
		step: null,
		regex: '',
	},
];

describe('trpc.users.update', () => {
	it('should not allow non-hackers to apply', () => {
		prisma.user.findUniqueOrThrow.mockResolvedValueOnce(sampleAdmin);
		expect(trpcTest('hacker').users.update({})).rejects.toThrowError(/permission/);
	});
	it('should not allow applications after deadline', () => {
		prisma.user.findUniqueOrThrow.mockResolvedValueOnce(sampleHacker);
		prisma.settings.findUniqueOrThrow.mockResolvedValueOnce({
			...sampleSettings,
			applicationOpen: false,
		});
		expect(trpcTest('admin').users.update({})).rejects.toThrowError(/closed/);
	});
	it('should not allow applications if user has already applied', () => {
		prisma.user.findUniqueOrThrow.mockResolvedValueOnce({ ...sampleHacker, status: 'APPLIED' });
		prisma.settings.findUniqueOrThrow.mockResolvedValueOnce(sampleSettings);
		expect(trpcTest('hacker').users.update({})).rejects.toThrowError(/already/);
	});
	it('should only update application with valid question IDs', async () => {
		prisma.user.findUniqueOrThrow.mockResolvedValueOnce(sampleHacker);
		prisma.settings.findUniqueOrThrow.mockResolvedValueOnce(sampleSettings);
		prisma.question.findMany.mockResolvedValueOnce(sampleQuestions);
		await trpcTest('hacker').users.update({
			'invalid question ID': 'invalid answer',
			[sampleQuestions[0].id]: 'J. Random Hacker',
		});
		expect(prisma.user.update).toHaveBeenCalledWith({
			where: { magicLink: sampleHacker.magicLink },
			data: {
				application: {
					[sampleQuestions[0].id]: 'J. Random Hacker',
					[sampleQuestions[1].id]: undefined,
				},
			},
		});
	});
	it('should delete any pending decisions', async () => {
		prisma.user.findUniqueOrThrow.mockResolvedValueOnce(sampleHacker);
		prisma.settings.findUniqueOrThrow.mockResolvedValueOnce(sampleSettings);
		prisma.question.findMany.mockResolvedValueOnce(sampleQuestions);
		await trpcTest('hacker').users.update({});
		expect(prisma.decision.deleteMany).toHaveBeenCalledWith({ where: { userId: sampleHacker.id } });
	});
});
