import express from 'express';
import integrationsController from './integrations.controller.js';
import auth from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(auth());

router.route('/')
    .post(integrationsController.saveIntegration)
    .get(integrationsController.getIntegrations);

router.post('/test', integrationsController.testIntegration);

router.route('/:provider')
    .delete(integrationsController.deleteIntegration);

export default router;
