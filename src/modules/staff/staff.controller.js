import httpStatus from 'http-status';
import staffService from './staff.service.js';
import { success } from '../../utils/response.js';

const createStaff = async (req, res, next) => {
    try {
        const staff = await staffService.createStaff(req.body, req.workspaceId);
        success(res, 'Staff created', { staff }, httpStatus.CREATED);
    } catch (error) {
        next(error);
    }
};

const getStaff = async (req, res, next) => {
    try {
        const staff = await staffService.getStaff(req.workspaceId);
        success(res, 'Staff retrieved', { staff });
    } catch (error) {
        next(error);
    }
};

const updateStaff = async (req, res, next) => {
    try {
        const staff = await staffService.updateStaff(req.params.id, req.body);
        success(res, 'Staff updated', { staff });
    } catch (error) {
        next(error);
    }
};

const deleteStaff = async (req, res, next) => {
    try {
        await staffService.deleteStaff(req.params.id);
        success(res, 'Staff removed');
    } catch (error) {
        next(error);
    }
};

export default {
    createStaff,
    getStaff,
    updateStaff,
    deleteStaff
};

