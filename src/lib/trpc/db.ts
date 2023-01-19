import { PrismaClient } from '@prisma/client';
import { building } from '$app/environment';

const prisma = new PrismaClient();
if (!building) {
	await prisma.$connect();
}
export default prisma;
