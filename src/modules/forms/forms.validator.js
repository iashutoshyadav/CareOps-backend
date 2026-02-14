import Joi from 'joi';

const createForm = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().allow('', null).optional(),
        type: Joi.string().valid('JSON', 'PDF').default('JSON'),
        schema: Joi.object().when('type', { is: 'JSON', then: Joi.required(), otherwise: Joi.optional() }),
        fileUrl: Joi.string().when('type', { is: 'PDF', then: Joi.required(), otherwise: Joi.optional() }),
    }),
};

export default {
    createForm,
};