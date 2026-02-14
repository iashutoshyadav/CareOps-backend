import prisma from '../../config/database.js';
import httpStatus from 'http-status';
import { ApiError } from '../../middleware/error.middleware.js';
import passwordService from '../../utils/password.js';

const createStaff = async (staffBody, workspaceId) => {
    const existingUser = await prisma.user.findUnique({ where: { email: staffBody.email } });
    if (existingUser) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists');
    }

    const hashedPassword = await passwordService.hashPassword('tempPassword123');

    return prisma.user.create({
        data: {
            ...staffBody,
            role: 'STAFF',
            workspaceId,
            password: hashedPassword
        }
    });
};
const getStaff = async (workspaceId) => {
    return prisma.user.findMany({
        where: { workspaceId, role: 'STAFF' }
    });
};

const updateStaff = async (staffId, updateBody) => {
    return prisma.user.update({
        where: { id: staffId },
        data: updateBody
    });
};

const deleteStaff = async (staffId) => {
    return prisma.user.delete({
        where: { id: staffId }
    });
};

export default {
    createStaff,
    getStaff,
    updateStaff,
    deleteStaff
};
