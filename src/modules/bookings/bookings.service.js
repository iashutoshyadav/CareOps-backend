import httpStatus from 'http-status';
import prisma from '../../config/database.js';
import { ApiError } from '../../middleware/error.middleware.js';
import eventBus from '../../automation/eventBus.js';
import eventTypes from '../../automation/eventTypes.js';
import inventoryService from '../inventory/inventory.service.js';

const createBooking = async (bookingBody, workspaceId, userId) => {
    const conflicting = await prisma.booking.findFirst({
        where: {
            workspaceId,
            startTime: { lt: bookingBody.endTime },
            endTime: { gt: bookingBody.startTime },
            status: { not: 'CANCELLED' }
        }
    });
    if (conflicting) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Time slot conflict');
    }
    const booking = await prisma.booking.create({
        data: {
            ...bookingBody,
            workspaceId,
            staffId: userId
        },
        include: { contact: true, staff: true }
    });

    
    await inventoryService.subtractUsageForBooking(workspaceId);

    eventBus.emit(eventTypes.BOOKING_CREATED, booking);
    return booking;
};
const getBookings = async (workspaceId) => {
    return prisma.booking.findMany({
        where: { workspaceId },
        include: { contact: true, staff: true },
        orderBy: { startTime: 'asc' }
    });
};
const updateBookingStatus = async (bookingId, status, workspaceId) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    });

    if (!booking || booking.workspaceId !== workspaceId) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
        include: { contact: true, staff: true }
    });

    
    eventBus.emit(eventTypes.BOOKING_UPDATED, updatedBooking);

    return updatedBooking;
};

export default {
    createBooking,
    getBookings,
    updateBookingStatus,
};
