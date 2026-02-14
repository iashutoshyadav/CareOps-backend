import httpStatus from 'http-status';
import inboxService from './inbox.service.js';
import { success } from '../../utils/response.js';

const getMessages = async (req, res, next) => {
    try {
        const messages = await inboxService.getMessages(req.user.id);
        success(res, 'Messages retrieved', { messages });
    } catch (error) {
        next(error);
    }
};

const sendMessage = async (req, res, next) => {
    try {
        const message = await inboxService.sendMessage(req.body, req.user.id, req.workspaceId);
        success(res, 'Message sent', { message }, httpStatus.CREATED);
    } catch (error) {
        next(error);
    }
};

export default {
    getMessages,
    sendMessage,
};

