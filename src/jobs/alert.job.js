import logger from '../utils/logger.js';
import prisma from '../config/database.js';
import socketService from '../utils/socket.js';
import { subHours } from 'date-fns';

const runUnansweredMessageAlertJob = async () => {
    logger.info('Running unanswered message alert job...');

    const fortyEightHoursAgo = subHours(new Date(), 48);

    try {
        
        
        const unansweredMessages = await prisma.message.findMany({
            where: {
                createdAt: { lte: fortyEightHoursAgo },
                read: false,
                sender: {
                    role: 'USER' 
                    
                }
            },
            include: { workspace: true, sender: true }
        });

        logger.info(`Found ${unansweredMessages.length} potential unanswered messages`);

        for (const msg of unansweredMessages) {
            
            const admins = await prisma.user.findMany({
                where: {
                    workspaceId: msg.workspaceId,
                    role: 'ADMIN'
                }
            });

            for (const admin of admins) {
                await prisma.notification.create({
                    data: {
                        type: 'UNANSWERED_MESSAGE',
                        message: `Message from ${msg.sender.name} has been unanswered for 48 hours.`,
                        userId: admin.id
                    }
                });
            }

            
            await prisma.message.update({
                where: { id: msg.id },
                data: { read: true }
            });

            logger.info(`Alerted staff for message ${msg.id}`);
        }
    } catch (error) {
        logger.error('Error running message alert job', error);
    }
};

export default runUnansweredMessageAlertJob;
