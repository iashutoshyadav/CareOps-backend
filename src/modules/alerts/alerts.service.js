import prisma from '../../config/database.js';

const getAlerts = async (userId) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};

export default {
    getAlerts,
};
