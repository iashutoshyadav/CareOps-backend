import Joi from 'joi';

const createItem = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        sku: Joi.string().optional(),
        quantity: Joi.number().required().min(0),
        threshold: Joi.number().default(10),
        usagePerBooking: Joi.number().integer().min(0),
        price: Joi.number().optional(),
    }),
};

export default {
    createItem,
};
