import express from 'express';
import auth from '../../middleware/auth.middleware.js';
import inboxController from './inbox.controller.js';

const router = express.Router();

router.get('/', auth(), inboxController.getMessages);
router.post('/', auth(), inboxController.sendMessage);


export default router;
