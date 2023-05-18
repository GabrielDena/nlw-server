import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function memoriesRoutes(app: FastifyInstance) {
    app.get('/', async () => {
        const memories = await prisma.memory.findMany({
            orderBy: {
                createdAt: 'asc',
            },
        });

        return memories.map((memory) => {
            return {
                id: memory.id,
                coverUrl: memory.coverUrl,
                excerpt: memory.content.substring(0, 115).concat('...'),
            };
        });
    });

    app.get('/:id', async (req) => {
        const paramsSchema = z.object({
            id: z.string().uuid(),
        });
        const { id } = paramsSchema.parse(req.params);

        const memory = await prisma.memory.findUniqueOrThrow({
            where: { id },
        });

        return memory;
    });

    app.post('/', async (req) => {
        const bodySchema = z.object({
            content: z.string(),
            coverUrl: z.string(),
            isPublic: z.coerce.boolean().default(false),
        });

        const { content, isPublic, coverUrl } = bodySchema.parse(req.body);

        const memory = await prisma.memory.create({
            data: {
                content,
                coverUrl,
                isPublic,
                userId: 'b807a378-533d-46bb-82b9-813d93a27a38',
            },
        });

        return memory;
    });

    app.put('/:id', async (req) => {
        const paramsSchema = z.object({
            id: z.string().uuid(),
        });
        const { id } = paramsSchema.parse(req.params);

        const bodySchema = z.object({
            content: z.string(),
            coverUrl: z.string(),
            isPublic: z.coerce.boolean().default(false),
        });

        const { content, isPublic, coverUrl } = bodySchema.parse(req.body);

        const memory = await prisma.memory.update({
            where: { id },
            data: {
                content,
                coverUrl,
                isPublic,
            },
        });

        return memory;
    });

    app.delete('/:id', async (req) => {
        const paramsSchema = z.object({
            id: z.string().uuid(),
        });
        const { id } = paramsSchema.parse(req.params);

        await prisma.memory.delete({
            where: { id },
        });

        return true;
    });
}
