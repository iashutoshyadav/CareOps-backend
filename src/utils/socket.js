import { Server } from 'socket.io';
import logger from './logger.js';
import config from '../config/env.js';

let io;

const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: [config.appUrl || "*"],
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Client connected: ${socket.id}`);

        socket.on('join-workspace', (workspaceId) => {
            socket.join(workspaceId);
            logger.info(`Socket ${socket.id} joined workspace ${workspaceId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

const emitToWorkspace = (workspaceId, event, data) => {
    if (io) {
        io.to(workspaceId).emit(event, data);
    }
};

export default {
    init,
    getIO,
    emitToWorkspace
};
