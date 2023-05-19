import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function memoriesRoutes(app: FastifyInstance) {
    app.addHook('preHandler', async (req) => {
        await req.jwtVerify();
    });

    app.get('/', async (req) => {
        const { sub } = req.user;

        const memories = await prisma.memory.findMany({
            orderBy: {
                createdAt: 'asc',
            },
            where: {
                userId: sub,
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

    app.get('/:id', async (req, reply) => {
        const paramsSchema = z.object({
            id: z.string().uuid(),
        });
        const { id } = paramsSchema.parse(req.params);

        const memory = await prisma.memory.findUniqueOrThrow({
            where: { id },
        });

        if (!memory.isPublic && memory.userId !== req.user.sub) {
            reply.status(401).send();
        }

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
                userId: req.user.sub,
            },
        });

        return memory;
    });

    app.put('/:id', async (req, reply) => {
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

        let memory = await prisma.memory.findUniqueOrThrow({
            where: { id },
        });

        if (memory.userId !== req.user.sub) {
            return reply.status(401).send();
        }

        memory = await prisma.memory.update({
            where: { id },
            data: {
                content,
                coverUrl,
                isPublic,
            },
        });

        return memory;
    });

    app.delete('/:id', async (req, reply) => {
        const paramsSchema = z.object({
            id: z.string().uuid(),
        });
        const { id } = paramsSchema.parse(req.params);

        const memory = await prisma.memory.findUniqueOrThrow({
            where: { id },
        });

        if (memory.userId !== req.user.sub) {
            return reply.status(401).send();
        }
        await prisma.memory.delete({
            where: { id },
        });

        return true;
    });
}
