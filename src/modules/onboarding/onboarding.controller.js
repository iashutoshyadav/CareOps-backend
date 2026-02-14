import httpStatus from 'http-status';
import onboardingService from './onboarding.service.js';
import { success } from '../../utils/response.js';

const startOnboarding = async (req, res, next) => {
    try {
        const result = await onboardingService.startOnboarding(req.body, req.user);
        success(res, 'Onboarding completed', { result });
    } catch (error) {
        next(error);
    }
};

const getActivationStatus = async (req, res, next) => {
    try {
        const result = await onboardingService.getActivationStatus(req.workspaceId);
        success(res, 'Activation status retrieved', { result });
    } catch (error) {
        next(error);
    }
};

const activateWorkspace = async (req, res, next) => {
    try {
        const result = await onboardingService.activateWorkspace(req.workspaceId);
        success(res, 'Workspace activated successfully', { result });
    } catch (error) {
        next(error);
    }
};

export default {
    startOnboarding,
    getActivationStatus,
    activateWorkspace,
};
