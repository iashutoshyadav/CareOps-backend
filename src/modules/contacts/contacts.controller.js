import httpStatus from 'http-status';
import contactsService from './contacts.service.js';
import { success } from '../../utils/response.js';
import { ApiError } from '../../middleware/error.middleware.js';

const createContact = async (req, res, next) => {
    try {
        if (!req.workspaceId) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'User must be associated with a workspace to create contacts');
        }
        const contact = await contactsService.createContact(req.body, req.workspaceId);
        success(res, 'Contact created', { contact }, httpStatus.CREATED);
    } catch (error) {
        next(error);
    }
};

const getContacts = async (req, res, next) => {
    try {
        if (!req.workspaceId) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'User must be associated with a workspace to view contacts');
        }
        const contacts = await contactsService.getContacts(req.workspaceId);
        success(res, 'Contacts retrieved', { contacts });
    } catch (error) {
        next(error);
    }
};


const updateContact = async (req, res, next) => {
    try {
        const contact = await contactsService.updateContact(req.params.id, req.body);
        success(res, 'Contact updated', { contact });
    } catch (error) {
        next(error);
    }
};

const deleteContact = async (req, res, next) => {
    try {
        await contactsService.deleteContact(req.params.id);
        success(res, 'Contact deleted');
    } catch (error) {
        next(error);
    }
};

export default {
    createContact,
    getContacts,
    updateContact,
    deleteContact
};

