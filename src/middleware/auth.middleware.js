import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import config from '../config/env.js';
import { ApiError } from './error.middleware.js';
import prisma from '../config/database.js';

const auth = () => async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
        }
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, config.jwt.secret);

        let user = await prisma.user.findUnique({
            where: { id: payload.sub },
            include: { workspace: true }
        });

        if (!user) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
        }

        // Global Fail-safe: If user object mission workspaceId but database has it
        if (user && !user.workspaceId) {
            // Redundant but safe check
            const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
            if (freshUser?.workspaceId) {
                user.workspaceId = freshUser.workspaceId;
            }
        }

        req.user = user;
        req.workspaceId = user.workspaceId;

        next();
    } catch (error) {
        next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
};



export default auth;
