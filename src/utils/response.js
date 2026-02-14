import httpStatus from 'http-status';

export const success = (res, message, data, statusCode = httpStatus.OK) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const error = (res, message, statusCode = httpStatus.INTERNAL_SERVER_ERROR) => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
};
