import httpStatus from 'http-status';
import alertsService from './alerts.service.js';
import { success } from '../../utils/response.js';

const getAlerts = async (req, res, next) => {
    try {
        const alerts = await alertsService.getAlerts(req.user.id);
        success(res, 'Alerts retrieved', { alerts });
    } catch (error) {
        next(error);
    }
};

export default {
    getAlerts,
};
