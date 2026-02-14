import httpStatus from 'http-status';
import authService from './auth.service.js';
import { success } from '../../utils/response.js';

const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        const tokens = await authService.generateAuthTokens(user);
        const { password, ...userWithoutPassword } = user;
        success(res, 'User registered successfully', { user: userWithoutPassword, tokens }, httpStatus.CREATED);
    } catch (error) {
        console.error('Register Error:', error);
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authService.login(email, password);
        const tokens = await authService.generateAuthTokens(user);
        const { password: userPassword, ...userWithoutPassword } = user;
        success(res, 'Logged in successfully', { user: userWithoutPassword, tokens });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        await authService.logout(req.body.refreshToken);
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

const refreshTokens = async (req, res, next) => {
    try {
        const tokens = await authService.refreshTokens(req.body.refreshToken);
        success(res, 'Tokens refreshed', { tokens });
    } catch (error) {
        next(error);
    }
};

export default {
    register,
    login,
    logout,
    refreshTokens,
};
