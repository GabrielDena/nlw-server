import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import 'dotenv/config';
import fastify from 'fastify';
import { authRoutes } from './routes/auth.routes';
import { memoriesRoutes } from './routes/memories.routes';

const app = fastify();

app.register(cors, {
    origin: true,
});

app.register(jwt, {
    secret: process.env.JWT_SECRET as string,
});

app.register(memoriesRoutes, { prefix: 'memories' });
app.register(authRoutes);

app.listen({
    port: 3333,
    host: '0.0.0.0',
}).then(() => {
    console.log('HTTP server running on port 3333');
});
