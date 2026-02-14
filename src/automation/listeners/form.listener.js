import eventBus from '../eventBus.js';
import socketService from '../../utils/socket.js';
import prisma from '../../config/database.js';

import eventTypes from '../eventTypes.js';
import logger from '../../utils/logger.js';

const initFormListener = () => {
    eventBus.on(eventTypes.FORM_SUBMITTED, async (submission) => {
        try {
            socketService.emitToWorkspace(submission.form.workspaceId, 'FORM_SUBMITTED', submission);

            
            if (submission.contactId) {
                
                const workspace = await prisma.workspace.findUnique({
                    where: { id: submission.form.workspaceId },
                    include: { users: { take: 1 } }
                });
                const owner = workspace.users[0];

                if (owner) {
                    
                    await prisma.message.create({
                        data: {
                            content: "Thanks for your submission! We'll get back to you shortly.",
                            workspaceId: submission.form.workspaceId,
                            senderId: owner.id,
                            receiverId: owner.id, 
                            contactId: submission.contactId,
                            read: true
                        }
                    });

                    
                    
                }
            }

            logger.info(`Form submitted event processed: ${submission.id}`);
        } catch (error) {
            logger.error(`Error in form listener: ${error.message}`);
        }
    });
};

export default initFormListener;
