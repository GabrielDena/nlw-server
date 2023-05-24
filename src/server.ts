import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import 'dotenv/config';
import fastify from 'fastify';
import { resolve } from 'node:path';
import { authRoutes } from './routes/auth.routes';
import { memoriesRoutes } from './routes/memories.routes';
import { uploadRoutes } from './routes/upload.routes';

const app = fastify();

app.register(multipart);

app.register(require('@fastify/static'), {
    root: resolve(process.cwd(), 'uploads'),
    prefix: '/uploads',
});

app.register(cors, {
    origin: true,
});

app.register(jwt, {
    secret: process.env.JWT_SECRET as string,
});

app.register(memoriesRoutes, { prefix: 'memories' });
app.register(authRoutes);
app.register(uploadRoutes, { prefix: 'upload' });

app.listen({
    port: 3333,
    host: '0.0.0.0',
}).then(() => {
    console.log('HTTP server running on port 3333');
});
