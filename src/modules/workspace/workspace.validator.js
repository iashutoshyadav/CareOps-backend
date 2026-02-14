import Joi from 'joi';

const createWorkspace = {
    body: Joi.object().keys({
        name: Joi.string().required(),
    }),
};

export default {
    createWorkspace,
};
