import httpStatus from 'http-status';
import publicService from './public.service.js';
import { success } from '../../utils/response.js';

const getInfo = async (req, res, next) => {
    try {
        const info = await publicService.getInfo();
        success(res, 'Public info retrieved', { info });
    } catch (error) {
        next(error);
    }
};

const getForm = async (req, res, next) => {
    try {
        const form = await publicService.getPublicFormById(req.params.id);
        success(res, 'Form retrieved', { form });
    } catch (error) {
        next(error);
    }
};

const submitForm = async (req, res, next) => {
    try {
        const submission = await publicService.submitForm(req.params.id, req.body.data, req.body.contactInfo);
        success(res, 'Form submitted', { submission }, httpStatus.CREATED);
    } catch (error) {
        next(error);
    }
};

const getBookingPageInfo = async (req, res, next) => {
    try {
        const info = await publicService.getBookingPageInfo(req.params.slug);
        if (!info) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Workspace not found' });
        }
        success(res, 'Booking page info retrieved', { info });
    } catch (error) {
        next(error);
    }
};

const getSlots = async (req, res, next) => {
    try {
        const { workspaceId, serviceId, date } = req.query;
        const slots = await publicService.getAvailableSlots(workspaceId, serviceId, date);
        success(res, 'Available slots retrieved', { slots });
    } catch (error) {
        next(error);
    }
};

const handleWebhook = async (req, res, next) => {
    try {
        const { workspaceId, sender, content } = req.body;
        const message = await publicService.handleIncomingMessage(workspaceId, sender, content);
        success(res, 'Webhook handled', { message }, httpStatus.CREATED);
    } catch (error) {
        next(error);
    }
};

const submitBooking = async (req, res, next) => {
    try {
        const submission = await publicService.submitBooking(req.params.slug, req.body.data, req.body.contactInfo);
        success(res, 'Booking confirmed', { submission }, httpStatus.CREATED);
    } catch (error) {
        next(error);
    }
};

export default {
    getInfo,
    getForm,
    submitForm,
    getBookingPageInfo,
    getSlots,
    handleWebhook,
    submitBooking,
};



