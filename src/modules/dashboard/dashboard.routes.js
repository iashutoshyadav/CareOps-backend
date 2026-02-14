import express from 'express';
import auth from '../../middleware/auth.middleware.js';
import dashboardController from './dashboard.controller.js';

const router = express.Router();

router.get('/stats', auth(), dashboardController.getStats);

export default router;
