import httpStatus from 'http-status';
import { ApiError } from '../../middleware/error.middleware.js';
import prisma from '../../config/database.js';

const createWorkspace = async (workspaceBody, user) => {
    try {

        const workspace = await prisma.workspace.create({
            data: {
                name: workspaceBody.name,
                slug: workspaceBody.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now()
            }
        });


        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { workspaceId: workspace.id }
        });


        return workspace;
    } catch (error) {
        throw error;
    }
};

const getWorkspaces = async (user) => {
    return prisma.workspace.findMany({
        where: {
            users: {
                some: { id: user.id }
            }
        },
        include: {
            serviceTypes: true,
            operatingHours: true,
            integrations: {
                select: {
                    id: true,
                    provider: true,
                    isActive: true

                }
            }
        }
    });
};

const updateAvailability = async (workspaceId, availabilityData) => {






    const ops = availabilityData.map(slot => {
        return prisma.operatingHours.upsert({
            where: {
                workspaceId_dayOfWeek: {
                    workspaceId,
                    dayOfWeek: slot.dayOfWeek
                }
            },
            update: {
                startTime: slot.startTime,
                endTime: slot.endTime,
                isActive: slot.isActive
            },
            create: {
                workspaceId,
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isActive: slot.isActive
            }
        });
    });

    await prisma.$transaction(ops);
    return prisma.operatingHours.findMany({ where: { workspaceId } });
};

const getAvailability = async (workspaceId) => {
    return prisma.operatingHours.findMany({
        where: { workspaceId },
        orderBy: { dayOfWeek: 'asc' }
    });
};

const updateWorkspace = async (workspaceId, updateBody) => {
    return prisma.workspace.update({
        where: { id: workspaceId },
        data: updateBody
    });
};

export default {
    createWorkspace,
    getWorkspaces,
    updateAvailability,
    getAvailability,
    updateWorkspace,
};
