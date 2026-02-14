import express from 'express';
import servicesController from './services.controller.js';
import auth from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(auth()); 

router.route('/')
    .post(servicesController.createService)
    .get(servicesController.getServices);

router.route('/:serviceId')
    .patch(servicesController.updateService)
    .delete(servicesController.deleteService);

export default router;
