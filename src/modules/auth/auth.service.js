import httpStatus from 'http-status';
import { ApiError } from '../../middleware/error.middleware.js';
import prisma from '../../config/database.js';
import tokenService from '../../utils/token.js';
import passwordService from '../../utils/password.js';
import { tokenTypes } from '../../config/constants.js';
import dateUtils from '../../utils/dateUtils.js';
import config from '../../config/env.js';

const register = async (userBody) => {
    if (await prisma.user.findUnique({ where: { email: userBody.email } })) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    const hashedPassword = await passwordService.hashPassword(userBody.password);
    const user = await prisma.user.create({
        data: {
            ...userBody,
            password: hashedPassword,
        },
    });
    return user;
};

const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await passwordService.verifyPassword(password, user.password))) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }
    return user;
};

const logout = async (refreshToken) => {
    const refreshTokenDoc = await prisma.token.findFirst({
        where: { token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false },
    });
    if (!refreshTokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    await prisma.token.delete({ where: { id: refreshTokenDoc.id } });
};

const refreshTokens = async (refreshToken) => {
    try {
        const refreshTokenDoc = await prisma.token.findFirst({
            where: { token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false }
        });
        if (!refreshTokenDoc) {
            throw new Error();
        }
        const user = await prisma.user.findUnique({ where: { id: refreshTokenDoc.userId } });
        if (!user) {
            throw new Error();
        }
        await prisma.token.delete({ where: { id: refreshTokenDoc.id } });
        return generateAuthTokens(user);
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
};

const generateAuthTokens = async (user) => {
    const accessTokenExpires = dateUtils.addMinutes(new Date(), config.jwt.accessExpirationMinutes);
    const accessToken = tokenService.generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

    const refreshTokenExpires = dateUtils.addDays(new Date(), config.jwt.refreshExpirationDays);
    const refreshToken = tokenService.generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);

    await prisma.token.create({
        data: {
            token: refreshToken,
            user: { connect: { id: user.id } },
            type: tokenTypes.REFRESH,
            expires: refreshTokenExpires
        }
    });

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDateString()
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDateString()
        }
    };
};

export default {
    register,
    login,
    logout,
    refreshTokens,
    generateAuthTokens
};
