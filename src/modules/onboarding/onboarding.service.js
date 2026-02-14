import httpStatus from 'http-status';
import prisma from '../../config/database.js';
import { ApiError } from '../../middleware/error.middleware.js';

const startOnboarding = async (body, user) => {
    const { workspaceName, role } = body;
    if (user.workspaceId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User already has a workspace');
    }
    const workspace = await prisma.workspace.create({
        data: {
            name: workspaceName,
            users: {
                connect: { id: user.id }
            }
        }
    });
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            workspaceId: workspace.id,
            role: role || 'ADMIN'
        }
    });
    return { workspace, user: updatedUser };
};

const getActivationStatus = async (workspaceId) => {
    if (!workspaceId) {
        return { isActivated: false, missingSteps: ['workspace'] };
    }
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            serviceTypes: true,
            operatingHours: true,
            integrations: { where: { isActive: true } }
        }
    });

    if (!workspace) {
        return { isActivated: false, missingSteps: ['workspace'] };
    }

    const hasServices = workspace.serviceTypes.length > 0;
    const hasAvailability = workspace.operatingHours.length > 0;
    const hasIntegrations = workspace.integrations.length > 0;

    return {
        isActivated: workspace.isActive,
        services: hasServices,
        availability: hasAvailability,
        integrations: hasIntegrations,
        isReady: hasServices && hasAvailability && hasIntegrations
    };
};

const activateWorkspace = async (workspaceId) => {
    if (!workspaceId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Workspace ID is required');
    }
    return prisma.workspace.update({
        where: { id: workspaceId },
        data: { isActive: true }
    });
};

export default {
    startOnboarding,
    getActivationStatus,
    activateWorkspace,
};