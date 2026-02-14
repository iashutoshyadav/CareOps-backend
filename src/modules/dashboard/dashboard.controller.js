import httpStatus from 'http-status';
import dashboardService from './dashboard.service.js';
import { success } from '../../utils/response.js';

const getStats = async (req, res, next) => {
    try {
        const stats = await dashboardService.getStats(req.workspaceId, req.user);
        success(res, 'Stats retrieved', { stats });
    } catch (error) {
        next(error);
    }
};

export default {
    getStats,
};
