import axios from 'axios';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function authRoutes(app: FastifyInstance) {
    app.post('/register', async (req) => {
        const bodySchema = z.object({
            code: z.string(),
            isMobile: z.coerce.boolean().default(false),
        });
        const { code, isMobile } = bodySchema.parse(req.body);

        const gitHubCredentials = {
            client_id: isMobile
                ? process.env.MOBILE_GITHUB_CLIENT_ID
                : process.env.GITHUB_CLIENT_ID,
            client_secret: isMobile
                ? process.env.MOBILE_GITHUB_CLIENT_SECRET
                : process.env.GITHUB_CLIENT_SECRET,
        };
        const accessTokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            null,
            {
                params: {
                    client_id: gitHubCredentials.client_id,
                    client_secret: gitHubCredentials.client_secret,
                    code,
                },
                headers: {
                    Accept: 'application/json',
                },
            },
        );
        const { access_token } = accessTokenResponse.data;
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const userSchema = z.object({
            id: z.number(),
            login: z.string(),
            name: z.string(),
            avatar_url: z.string().url(),
        });

        const userGithub = userSchema.parse(userResponse.data);

        let user = await prisma.user.findUnique({
            where: {
                githubId: userGithub.id,
            },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    githubId: userGithub.id,
                    login: userGithub.login,
                    name: userGithub.name,
                    avatarUrl: userGithub.avatar_url,
                },
            });
        }

        const token = app.jwt.sign(
            {
                name: user.name,
                avatarUrl: user.avatarUrl,
            },
            {
                sub: user.id,
                expiresIn: '30 days',
            },
        );

        return {
            token,
        };
    });
}
