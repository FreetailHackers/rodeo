import type { Question } from '@prisma/client';
import prisma from '../db';
import { t } from '../t';

export const getQuestions: () => Promise<Question[]> = async () => {
	return await prisma.question.findMany({
		orderBy: [{ id: 'asc' }],
	});
};

export const questionsRouter = t.router({
	/**
	 * Gets all questions.
	 */
	get: t.procedure.query(async (): Promise<Question[]> => {
		return await getQuestions();
	}),
});
