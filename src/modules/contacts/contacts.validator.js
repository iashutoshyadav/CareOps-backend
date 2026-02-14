import Joi from 'joi';

const createContact = {
    body: Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().optional().allow(null, ''),
        phone: Joi.string().optional().allow(null, ''),
        type: Joi.string().valid('PATIENT', 'CLIENT', 'VENDOR', 'OTHER').default('PATIENT'),
    }),
};

export default {
    createContact,
};
