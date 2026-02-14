import express from 'express';
import auth from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validation.middleware.js';
import workspaceValidation from './workspace.validator.js';
import workspaceController from './workspace.controller.js';
const router = express.Router();
router.post('/', auth(), validate(workspaceValidation.createWorkspace), workspaceController.createWorkspace);
router.get('/', auth(), workspaceController.getWorkspaces);

router.route('/availability')
    .get(auth(), workspaceController.getAvailability)
    .put(auth(), workspaceController.updateAvailability);

router.patch('/', auth(), workspaceController.updateWorkspace);

export default router;

