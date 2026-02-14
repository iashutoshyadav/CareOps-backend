import Joi from 'joi';

const createStaff = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        name: Joi.string().required(),
    }),
};

export default {
    createStaff,
};
