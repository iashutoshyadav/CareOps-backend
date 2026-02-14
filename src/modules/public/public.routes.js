import express from 'express';
import publicController from './public.controller.js';

const router = express.Router();

router.get('/info', publicController.getInfo);

router.get('/forms/:id', publicController.getForm);
router.post('/forms/:id/submit', publicController.submitForm);

router.get('/book/:slug', publicController.getBookingPageInfo);
router.get('/slots', publicController.getSlots);
router.post('/book/:slug/confirm', publicController.submitBooking);
router.post('/webhook', publicController.handleWebhook);




export default router;
