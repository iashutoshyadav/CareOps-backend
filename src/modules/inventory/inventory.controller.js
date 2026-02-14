import httpStatus from 'http-status';
import inventoryService from './inventory.service.js';
import { success } from '../../utils/response.js';

const createItem = async (req, res, next) => {
    try {
        const item = await inventoryService.createItem(req.body, req.workspaceId);
        success(res, 'Item created', { item }, httpStatus.CREATED);
    } catch (error) {
        next(error);
    }
};

const getItems = async (req, res, next) => {
    try {
        const items = await inventoryService.getItems(req.workspaceId);
        success(res, 'Items retrieved', { items });
    } catch (error) {
        next(error);
    }
};

const updateItem = async (req, res, next) => {
    try {
        const item = await inventoryService.updateItem(req.params.id, req.body);
        success(res, 'Item updated', { item });
    } catch (error) {
        next(error);
    }
};

const deleteItem = async (req, res, next) => {
    try {
        await inventoryService.deleteItem(req.params.id);
        success(res, 'Item deleted');
    } catch (error) {
        next(error);
    }
};

const getForecast = async (req, res, next) => {
    try {
        const forecast = await inventoryService.getForecast(req.workspaceId);
        success(res, 'Forecast retrieved', { forecast });
    } catch (error) {
        next(error);
    }
};

export default {
    createItem,
    getItems,
    updateItem,
    deleteItem,
    getForecast
};

