import httpStatus from 'http-status';
import servicesService from './services.service.js';
import { success } from '../../utils/response.js';
import { ApiError } from '../../middleware/error.middleware.js';

const createService = async (req, res, next) => {
    try {
        let workspaceId = req.user?.workspaceId;


        // Fail-safe: Fetch fresh user if workspaceId is missing in session
        if (!workspaceId) {
            const user = await servicesService.getUserWorkspace(req.user.id);
            workspaceId = user?.workspaceId;
        }

        if (!workspaceId) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Workspace ID is required. Please set up your clinic first.');
        }

        const service = await servicesService.createService(req.body, workspaceId);
        success(res, 'Service created successfully', { service }, httpStatus.CREATED);
    } catch (error) {
        next(error);
    }
};

const getServices = async (req, res, next) => {
    try {
        let workspaceId = req.user?.workspaceId;

        // Fail-safe
        if (!workspaceId) {
            const user = await servicesService.getUserWorkspace(req.user.id);
            workspaceId = user?.workspaceId;
        }

        const services = await servicesService.getServices(workspaceId);
        success(res, 'Services retrieved successfully', { services });
    } catch (error) {
        next(error);
    }
};

const updateService = async (req, res, next) => {
    try {
        const service = await servicesService.updateService(req.params.serviceId, req.body, req.user.workspaceId);
        success(res, 'Service updated successfully', { service });
    } catch (error) {
        next(error);
    }
};

const deleteService = async (req, res, next) => {
    try {
        await servicesService.deleteService(req.params.serviceId, req.user.workspaceId);
        success(res, 'Service deleted successfully');
    } catch (error) {
        next(error);
    }
};

export default {
    createService,
    getServices,
    updateService,
    deleteService
};
