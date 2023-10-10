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
			const lastOrder = orders.length === 0 ? 0 : Math.max(...orders);
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
	 * Moves a question one position down. User must be an admin. Does
	 * nothing if the question is already at the bottom.
	 */
	moveDown: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.string())
		.mutation(async (req): Promise<void> => {
			const question = await prisma.question.findUniqueOrThrow({
				where: { id: req.input },
			});
			const nextQuestion = await prisma.question.findFirst({
				where: { order: { gt: question.order } },
				orderBy: [{ order: 'asc' }],
			});
			if (nextQuestion === null) {
				return;
			}
			// To swap the question orders, we must temporarily set the first
			// question's order to -1 to avoid a unique constraint violation.
			const clearX = prisma.question.update({
				where: { id: question.id },
				data: { order: -1 },
			});
			const setYtoX = prisma.question.update({
				where: { id: nextQuestion.id },
				data: { order: question.order },
			});
			const setXtoY = prisma.question.update({
				where: { order: -1 },
				data: { order: nextQuestion.order },
			});
			await prisma.$transaction([clearX, setYtoX, setXtoY]);
		}),

	/**
	 * Moves a question one position up. User must be an admin. Does
	 * nothing if the question is already at the top.
	 */
	moveUp: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.string())
		.mutation(async (req): Promise<void> => {
			const question = await prisma.question.findUniqueOrThrow({
				where: { id: req.input },
			});
			const prevQuestion = await prisma.question.findFirst({
				where: { order: { lt: question.order } },
				orderBy: [{ order: 'desc' }],
			});
			if (prevQuestion === null) {
				return;
			}
			// To swap the question orders, we must temporarily set the first
			// question's order to -1 to avoid a unique constraint violation.
			const clearX = prisma.question.update({
				where: { id: question.id },
				data: { order: -1 },
			});
			const setYtoX = prisma.question.update({
				where: { id: prevQuestion.id },
				data: { order: question.order },
			});
			const setXtoY = prisma.question.update({
				where: { order: -1 },
				data: { order: prevQuestion.order },
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
