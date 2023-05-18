import cors from '@fastify/cors';
import fastify from 'fastify';
import { memoriesRoutes } from './routes/memories.routes';

const app = fastify();

app.register(cors, {
    origin: true,
});

app.register(memoriesRoutes, { prefix: 'memories' });

app.listen({
    port: 3333,
}).then(() => {
    console.log('HTTP server running on port 3333');
});
