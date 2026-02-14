import express from 'express';
import auth from '../../middleware/auth.middleware.js';
import alertsController from './alerts.controller.js';

const router = express.Router();

router.get('/', auth(), alertsController.getAlerts);

export default router;
