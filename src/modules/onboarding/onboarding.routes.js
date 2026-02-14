import express from 'express';
import auth from '../../middleware/auth.middleware.js';
import onboardingController from './onboarding.controller.js';

const router = express.Router();

router.post('/start', auth(), onboardingController.startOnboarding);
router.get('/status', auth(), onboardingController.getActivationStatus);
router.post('/activate', auth(), onboardingController.activateWorkspace);

export default router;
