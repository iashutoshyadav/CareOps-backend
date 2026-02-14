import express from 'express';
import auth from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validation.middleware.js';
import formsValidation from './forms.validator.js';
import formsController from './forms.controller.js';

const router = express.Router();

router.post('/', auth(), validate(formsValidation.createForm), formsController.createForm);
router.get('/', auth(), formsController.getForms);
router.get('/:id', auth(), formsController.getFormById);


export default router;
