import httpStatus from 'http-status';
import formsService from './forms.service.js';
import { success } from '../../utils/response.js';

const createForm = async (req, res, next) => {
    try {
        const form = await formsService.createForm(req.body, req.workspaceId);
        success(res, 'Form created', { form }, httpStatus.CREATED);
    } catch (error) {
        next(error);
    }
};

const getForms = async (req, res, next) => {
    try {
        const forms = await formsService.getForms(req.workspaceId);
        success(res, 'Forms retrieved', { forms });
    } catch (error) {
        next(error);
    }
};

const getFormById = async (req, res, next) => {
    try {
        const form = await formsService.getFormById(req.params.id, req.workspaceId);
        success(res, 'Form retrieved', { form });
    } catch (error) {
        next(error);
    }
};

export default {
    createForm,
    getForms,
    getFormById,
};

