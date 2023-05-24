import { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { extname, resolve } from 'node:path';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';

const pump = promisify(pipeline);

export async function uploadRoutes(app: FastifyInstance) {
    app.post('/', async (req, rep) => {
        const upload = await req.file({
            limits: {
                fileSize: 5_242_880, // 5mb
            },
        });

        if (!upload) {
            return rep.status(400).send();
        }

        const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/g;
        const isValidFormat = mimeTypeRegex.test(upload.mimetype);

        if (!isValidFormat) {
            return rep.status(400).send('Invalid Format');
        }

        const fileId = randomUUID();
        const extension = extname(upload.filename);

        const fileName = fileId.concat(extension);

        const writeStream = createWriteStream(resolve(process.cwd(), 'uploads', fileName));

        await pump(upload.file, writeStream);

        const fullUrl = req.protocol.concat('://').concat(req.hostname);
        const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString();

        return { fileUrl };
    });
}
