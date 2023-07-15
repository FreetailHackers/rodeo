import { describe, it, expect, vi } from 'vitest';
import { trpcTest } from '../router';
import { prisma } from '$lib/trpc/__mocks__/db';
import type { Prisma, Question, Settings, Status } from '@prisma/client';

vi.mock('$lib/trpc/db');

const sampleHacker: Prisma.UserGetPayload<{ include: { authUser: true } }> = {
	authUserId: 'hacker',
	authUser: {
		id: 'hacker',
		email: 'hacker@yopmail.com',
		role: ['HACKER'],
		status: 'VERIFIED',
	},
	application: {},
	scanCount: {},
};

const sampleAdmin: Prisma.UserGetPayload<{ include: { authUser: true } }> = {
	authUserId: 'admin',
	authUser: {
		id: 'admin',
		email: 'admin@yopmail.com',
		role: ['ADMIN'],
		status: 'CREATED',
	},
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

describe('trpc.users.get', () => {
	it('should throw error if session is invalid', async () => {
		await expect(trpcTest(null).users.get()).rejects.toThrow('Unauthorized');
	});
	it('should return logged-in user if called with no arguments', async () => {
		prisma.user.findUniqueOrThrow.mockResolvedValueOnce(sampleHacker);
		await expect(trpcTest(sampleHacker.authUser).users.get()).resolves.toEqual(sampleHacker);
	});
	it('should throw error if non-admin tries to get user by ID', async () => {
		prisma.user.findUniqueOrThrow.mockResolvedValueOnce(sampleHacker);
		await expect(trpcTest(sampleHacker.authUser).users.get('hacker')).rejects.toThrow('Forbidden');
		await expect(trpcTest(sampleHacker.authUser).users.get('admin')).rejects.toThrow('Forbidden');
	});
	it('should allow admins to get users by ID', async () => {
		prisma.user.findUniqueOrThrow.mockResolvedValueOnce(sampleHacker);
		await expect(trpcTest(sampleAdmin.authUser).users.get('hacker')).resolves.toEqual(sampleHacker);
		prisma.user.findUniqueOrThrow.mockResolvedValueOnce(sampleAdmin);
		await expect(trpcTest(sampleAdmin.authUser).users.get('admin')).resolves.toEqual(sampleAdmin);
	});
});

describe('trpc.users.update', () => {
	it('should throw error if session is invalid', async () => {
		await expect(trpcTest(null).users.update({})).rejects.toThrow('Unauthorized');
	});
	it('should throw error if user is not a hacker', async () => {
		await expect(trpcTest(sampleAdmin.authUser).users.update({})).rejects.toThrow('Forbidden');
	});
	it('should throw error if applications are closed', async () => {
		prisma.settings.findUniqueOrThrow.mockResolvedValueOnce({
			...sampleSettings,
			applicationOpen: false,
		});
		await expect(trpcTest(sampleHacker.authUser).users.update({})).rejects.toThrow('closed');
	});
	it('should throw error if user status is not CREATED', async () => {
		const statuses: Status[] = [
			'APPLIED',
			'ACCEPTED',
			'REJECTED',
			'WAITLISTED',
			'CONFIRMED',
			'DECLINED',
		];
		for (const status of statuses) {
			prisma.settings.findUniqueOrThrow.mockResolvedValueOnce(sampleSettings);
			const authUser = { ...sampleHacker.authUser, status };
			await expect(trpcTest(authUser).users.update({})).rejects.toThrow('already submitted');
		}
	});
	it('should only update application with valid question IDs', async () => {
		prisma.settings.findUniqueOrThrow.mockResolvedValueOnce(sampleSettings);
		prisma.user.findUniqueOrThrow.mockResolvedValueOnce(sampleHacker);
		prisma.question.findMany.mockResolvedValueOnce(sampleQuestions);
		await trpcTest(sampleHacker.authUser).users.update({ name: 'Joe', invalid: 'invalid' });
		expect(prisma.user.update).toHaveBeenCalledWith({
			where: { authUserId: sampleHacker.authUserId },
			data: { application: { name: 'Joe' } },
		});
	});
	it('should delete any pending decisions', async () => {
		prisma.settings.findUniqueOrThrow.mockResolvedValueOnce(sampleSettings);
		prisma.user.findUniqueOrThrow.mockResolvedValueOnce(sampleHacker);
		prisma.question.findMany.mockResolvedValueOnce(sampleQuestions);
		await trpcTest(sampleHacker.authUser).users.update({});
		expect(prisma.decision.deleteMany).toHaveBeenCalledWith({
			where: { userId: sampleHacker.authUserId },
		});
	});
});

describe('trpc.users.register', () => {
	it('should throw error if password is less than 8 characters', async () => {
		await expect(
			trpcTest(null).users.register({
				email: 'hacker@yopmail.com',
				password: '1234567',
			})
		).rejects.toThrow();
	});
});
