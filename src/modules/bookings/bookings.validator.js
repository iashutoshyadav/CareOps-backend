import Joi from 'joi';

const createBooking = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        startTime: Joi.date().required(),
        endTime: Joi.date().required().greater(Joi.ref('startTime')),
        contactId: Joi.string().optional(),
        notes: Joi.string().optional(),
    }),
};

export default {
    createBooking,
};
