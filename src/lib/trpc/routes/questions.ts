import { QuestionType, type Question } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

export const getQuestions: () => Promise<Question[]> = async () => {
	return await prisma.question.findMany({
		orderBy: [{ order: 'asc' }],
	});
};

export const questionsRouter = t.router({
	/**
	 * Gets all questions.
	 */
	get: t.procedure.query(async (): Promise<Question[]> => {
		return await getQuestions();
	}),

	/**
	 * Creates a new question. User must be an admin.
	 */
	create: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.nativeEnum(QuestionType))
		.mutation(async (req): Promise<Question> => {
			// TODO: Only supports adding at end for now
			const orders = (await getQuestions()).map((question) => question.order);
			const lastOrder = orders.length == 0 ? 0 : Math.max(...orders);
			return await prisma.question.create({
				data: {
					label: '',
					type: req.input,
					order: lastOrder + 1,
				},
			});
		}),

	/**
	 * Updates the given application questions. User must be an admin.
	 */
	update: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.record(z.record(z.any())))
		.mutation(async (req): Promise<void> => {
			for (const questionId in req.input) {
				await prisma.question.update({
					where: { id: questionId },
					data: { ...req.input[questionId] },
				});
			}
		}),

	/**
	 * Takes two question orders (indices) and swaps the questions at
	 * those orders. User must be an admin.
	 */
	swap: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.array(z.number()))
		.mutation(async (req): Promise<void> => {
			if (req.input.length != 2) {
				throw new Error('Expected exactly two question orders.');
			}
			const questions = await getQuestions();
			if (
				req.input[0] < 0 ||
				req.input[0] >= questions.length ||
				req.input[1] < 0 ||
				req.input[1] >= questions.length
			) {
				throw new Error('Question order out of bounds.');
			}
			// We must temporarily set the first question's order to -1
			// to avoid a unique constraint violation.
			const clearX = prisma.question.update({
				where: { order: req.input[0] },
				data: { order: -1 },
			});
			const setYtoX = prisma.question.update({
				where: { order: req.input[1] },
				data: { order: req.input[0] },
			});
			const setXtoY = prisma.question.update({
				where: { order: -1 },
				data: { order: req.input[1] },
			});
			await prisma.$transaction([clearX, setYtoX, setXtoY]);
		}),

	/**
	 * Deletes a question. User must be an admin.
	 */
	delete: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.string())
		.mutation(async (req): Promise<void> => {
			await prisma.question.deleteMany({ where: { id: req.input } });
		}),
});
