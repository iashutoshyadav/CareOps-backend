import express from 'express';
import auth from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validation.middleware.js';
import bookingsValidation from './bookings.validator.js';
import bookingsController from './bookings.controller.js';

const router = express.Router();

router.post('/', auth(), validate(bookingsValidation.createBooking), bookingsController.createBooking);
router.get('/', auth(), bookingsController.getBookings);
router.patch('/:id/status', auth(), bookingsController.updateBookingStatus);


export default router;
