import eventBus from '../eventBus.js';
import socketService from '../../utils/socket.js';

import eventTypes from '../eventTypes.js';
import logger from '../../utils/logger.js';

const initInventoryListener = () => {
    eventBus.on(eventTypes.INVENTORY_LOW, (data) => {
        try {
            logger.info(`Inventory low event received: ${JSON.stringify(data)}`);
            const { item } = data; 
            if (item && item.workspaceId) {
                socketService.emitToWorkspace(item.workspaceId, 'INVENTORY_UPDATED', item);
            } else {
                logger.warn('Inventory low event data missing item or workspaceId:', data);
            }
        } catch (error) {
            logger.error(`Error processing INVENTORY_LOW event: ${error.message}`, error);
        }
    });
};

export default initInventoryListener;
