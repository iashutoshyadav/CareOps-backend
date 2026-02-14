import prisma from '../../config/database.js';

const createForm = async (formBody, workspaceId) => {
    const { serviceTypeIds, ...rest } = formBody;

    const data = {
        ...rest,
        workspaceId
    };

    if (serviceTypeIds && Array.isArray(serviceTypeIds)) {
        data.serviceTypes = {
            connect: serviceTypeIds.map(id => ({ id }))
        };
    }

    return prisma.form.create({ data });
};

const getForms = async (workspaceId) => {
    return prisma.form.findMany({
        where: { workspaceId },
        include: { _count: { select: { submissions: true } } }
    });
};

const getFormById = async (id, workspaceId) => {
    return prisma.form.findFirst({
        where: { id, workspaceId },
        include: { _count: { select: { submissions: true } } }
    });
};

export default {
    createForm,
    getForms,
    getFormById,
};

