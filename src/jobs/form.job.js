import logger from '../utils/logger.js';
import prisma from '../config/database.js';
import { shouldAutomate } from '../utils/automation.js';
import { sendNotification } from '../utils/communication.js';
import { subHours } from 'date-fns';

const runFormReminderJob = async () => {
    logger.info('Running form status reminder job...');

    
    const fortyEightHoursAgo = subHours(new Date(), 48);

    try {
        const pendingContacts = await prisma.contact.findMany({
            where: {
                createdAt: { lte: fortyEightHoursAgo },
                submissions: { none: {} }, 
                isManualMode: false
            }
        });

        logger.info(`Found ${pendingContacts.length} contacts with pending forms`);

        for (const contact of pendingContacts) {
            const canAutomate = await shouldAutomate(contact.id);
            if (!canAutomate) continue;

            if (contact.email || contact.phone) {
                await sendNotification(contact.id, contact.workspaceId, {
                    subject: 'Action Required: Complete your forms',
                    body: `Hi ${contact.firstName}, we noticed you haven't completed your intake forms yet. Please do so to proceed with your care.`
                });
                logger.info(`Sent form reminder to contact ${contact.id}`);
            }
        }
    } catch (error) {
        logger.error('Error running form reminder job', error);
    }
};

export default runFormReminderJob;
