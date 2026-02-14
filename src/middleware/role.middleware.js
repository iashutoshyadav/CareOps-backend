import httpStatus from 'http-status';
import { ApiError } from './error.middleware.js';

const role = (...allowedRoles) => (req, res, next) => {
    if (!req.user || (allowedRoles.length && !allowedRoles.includes(req.user.role))) {
        return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
    next();
};

export default role;
