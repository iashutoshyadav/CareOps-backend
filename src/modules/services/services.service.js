import httpStatus from 'http-status';
import prisma from '../../config/database.js';
import { ApiError } from '../../middleware/error.middleware.js';

const createService = async (serviceBody, workspaceId) => {
    return prisma.serviceType.create({
        data: {
            ...serviceBody,
            workspaceId
        }
    });
};

const getServices = async (workspaceId) => {
    return prisma.serviceType.findMany({
        where: { workspaceId, isActive: true }
    });
};

const updateService = async (serviceId, updateBody, workspaceId) => {
    const service = await prisma.serviceType.findFirst({
        where: { id: serviceId, workspaceId }
    });
    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
    }
    return prisma.serviceType.update({
        where: { id: serviceId },
        data: updateBody
    });
};

const deleteService = async (serviceId, workspaceId) => {
    const service = await prisma.serviceType.findFirst({
        where: { id: serviceId, workspaceId }
    });
    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
    }
    return prisma.serviceType.delete({
        where: { id: serviceId }
    });
};

const getUserWorkspace = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { workspaceId: true }
    });
};

export default {
    createService,
    getServices,
    updateService,
    deleteService,
    getUserWorkspace
};
