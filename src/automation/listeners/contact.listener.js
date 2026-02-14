import eventBus from '../eventBus.js';
import socketService from '../../utils/socket.js';

import eventTypes from '../eventTypes.js';
import logger from '../../utils/logger.js';

const initContactListener = () => {
    eventBus.on(eventTypes.CONTACT_CREATED, async (contact) => {
        socketService.emitToWorkspace(contact.workspaceId, 'CONTACT_CREATED', contact);
    });
};

export default initContactListener;
