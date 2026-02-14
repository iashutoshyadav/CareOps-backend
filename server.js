import app from './src/app.js';
import config from './src/config/env.js';
import logger from './src/utils/logger.js';
import prisma from './src/config/database.js';
import initScheduler from './src/jobs/scheduler.js';
import initBookingListener from './src/automation/listeners/booking.listener.js';
import initContactListener from './src/automation/listeners/contact.listener.js';
import initFormListener from './src/automation/listeners/form.listener.js';
import initInventoryListener from './src/automation/listeners/inventory.listener.js';
import socketService from './src/utils/socket.js';

let server;


prisma.$connect().then(() => {
    logger.info('Connected to SQL Database');

    
    
    initBookingListener();
    initContactListener();
    initFormListener();
    initInventoryListener();
    logger.info('Automation initialized');

    server = app.listen(config.port, () => {
        logger.info(`Listening to port ${config.port}`);
        socketService.init(server);
    });

}).catch((e) => {
    logger.error('Failed to connect to database', e);
    process.exit(1);
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});
