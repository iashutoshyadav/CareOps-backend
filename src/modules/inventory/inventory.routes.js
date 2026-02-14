import express from 'express';
import auth from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validation.middleware.js';
import inventoryValidation from './inventory.validator.js';
import inventoryController from './inventory.controller.js';

const router = express.Router();

router.post('/', auth(), validate(inventoryValidation.createItem), inventoryController.createItem);
router.get('/', auth(), inventoryController.getItems);
router.get('/forecast', auth(), inventoryController.getForecast);
router.patch('/:id', auth(), auth(), inventoryController.updateItem);
router.delete('/:id', auth(), auth(), inventoryController.deleteItem);


export default router;
