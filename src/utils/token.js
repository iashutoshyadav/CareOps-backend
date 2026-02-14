import jwt from 'jsonwebtoken';
import config from '../config/env.js';

const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
    const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(expires.getTime() / 1000),
        type,
    };
    return jwt.sign(payload, secret);
};

const verifyToken = async (token, type) => {
    const payload = jwt.verify(token, config.jwt.secret);
    return payload;
};

export default {
    generateToken,
    verifyToken,
};
