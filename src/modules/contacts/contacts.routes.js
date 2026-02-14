import express from 'express';
import auth from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validation.middleware.js';
import contactsValidation from './contacts.validator.js';
import contactsController from './contacts.controller.js';

const router = express.Router();

router.post('/', auth(), validate(contactsValidation.createContact), contactsController.createContact);
router.get('/', auth(), contactsController.getContacts);
router.patch('/:id', auth(), contactsController.updateContact);
router.delete('/:id', auth(), contactsController.deleteContact);


export default router;
