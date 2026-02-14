import httpStatus from 'http-status';
import integrationsService from './integrations.service.js';
import { success } from '../../utils/response.js';

const saveIntegration = async (req, res, next) => {
    try {
        const { provider, credentials } = req.body;
        const integration = await integrationsService.createOrUpdateIntegration(provider, credentials, req.user.workspaceId);
        success(res, 'Integration saved successfully', { integration });
    } catch (error) {
        next(error);
    }
};

const testIntegration = async (req, res, next) => {
    try {
        const { provider, credentials } = req.body;
        await integrationsService.testConnection(provider, credentials);
        success(res, 'Connection test successful');
    } catch (error) {
        next(error);
    }
};

const getIntegrations = async (req, res, next) => {
    try {
        const integrations = await integrationsService.getIntegrations(req.user.workspaceId);
        success(res, 'Integrations retrieved successfully', { integrations });
    } catch (error) {
        next(error);
    }
};

const deleteIntegration = async (req, res, next) => {
    try {
        const { provider } = req.params;
        await integrationsService.deleteIntegration(provider, req.user.workspaceId);
        success(res, 'Integration removed successfully');
    } catch (error) {
        next(error);
    }
};

export default {
    saveIntegration,
    testIntegration,
    getIntegrations,
    deleteIntegration
};
