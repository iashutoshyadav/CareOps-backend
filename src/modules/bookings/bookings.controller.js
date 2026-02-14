import httpStatus from 'http-status';
import bookingsService from './bookings.service.js';
import { success } from '../../utils/response.js';

const createBooking = async (req, res, next) => {
    try {
        const booking = await bookingsService.createBooking(req.body, req.workspaceId, req.user.id);
        success(res, 'Booking created', { booking }, httpStatus.CREATED);
    } catch (error) {
        next(error);
    }
};

const getBookings = async (req, res, next) => {
    try {
        const bookings = await bookingsService.getBookings(req.workspaceId);
        success(res, 'Bookings retrieved', { bookings });
    } catch (error) {
        next(error);
    }
};

const updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const booking = await bookingsService.updateBookingStatus(req.params.id, status, req.workspaceId);
        success(res, 'Booking status updated', { booking });
    } catch (error) {
        next(error);
    }
};

export default {
    createBooking,
    getBookings,
    updateBookingStatus,
};

