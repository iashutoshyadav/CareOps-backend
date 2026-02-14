import express from 'express';
import auth from '../../middleware/auth.middleware.js';
import role from '../../middleware/role.middleware.js';
import validate from '../../middleware/validation.middleware.js';
import staffValidation from './staff.validator.js';
import staffController from './staff.controller.js';

const router = express.Router();

router.post('/', auth(), role('ADMIN'), validate(staffValidation.createStaff), staffController.createStaff);
router.get('/', auth(), staffController.getStaff);
router.patch('/:id', auth(), role('ADMIN'), staffController.updateStaff);
router.delete('/:id', auth(), role('ADMIN'), staffController.deleteStaff);


export default router;
