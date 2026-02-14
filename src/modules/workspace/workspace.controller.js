import httpStatus from 'http-status';
import workspaceService from './workspace.service.js';
import { success } from '../../utils/response.js';

const createWorkspace = async (req, res, next) => {
    try {
        const workspace = await workspaceService.createWorkspace(req.body, req.user);
        success(res, 'Workspace created', { workspace }, httpStatus.CREATED);
    } catch (error) {
        console.error("Controller Error:", error);
        next(error);
    }
};
const getWorkspaces = async (req, res, next) => {
    try {
        const workspaces = await workspaceService.getWorkspaces(req.user);
        success(res, 'Workspaces retrieved', { workspaces });
    } catch (error) {
        next(error);
    }
};
const updateAvailability = async (req, res, next) => {
    try {
        const availability = await workspaceService.updateAvailability(req.user.workspaceId, req.body);
        success(res, 'Availability updated', { availability });
    } catch (error) {
        next(error);
    }
};

const getAvailability = async (req, res, next) => {
    try {
        const availability = await workspaceService.getAvailability(req.user.workspaceId);
        success(res, 'Availability retrieved', { availability });
    } catch (error) {
        next(error);
    }
};

const updateWorkspace = async (req, res, next) => {
    try {
        const workspace = await workspaceService.updateWorkspace(req.workspaceId, req.body);
        success(res, 'Workspace updated', { workspace });
    } catch (error) {
        next(error);
    }
};

export default {
    createWorkspace,
    getWorkspaces,
    updateAvailability,
    getAvailability,
    updateWorkspace,
};
