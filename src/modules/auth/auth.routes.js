import express from 'express';
import validate from '../../middleware/validation.middleware.js';
import authValidation from './auth.validator.js';
import authController from './auth.controller.js';

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);

export default router;
