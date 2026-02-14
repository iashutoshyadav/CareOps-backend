import { EventEmitter } from 'events';
import logger from '../utils/logger.js';

class EventBus extends EventEmitter {
    constructor() {
        super();
        this.on('error', (error) => {
            logger.error(`EventBus Error: ${error.message}`);
        });
    }

    emit(type, data) {
        logger.info(`Event Emitted: ${type}`);
        super.emit(type, data);
    }
}

const eventBus = new EventBus();

export default eventBus;
