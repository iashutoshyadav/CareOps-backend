import emailService from '../integrations/email/email.service.js';
import smsService from '../integrations/sms/sms.service.js';
import logger from './logger.js';
import prisma from '../config/database.js';


export const sendNotification = async (contactId, workspaceId, messageData) => {
    const contact = await prisma.contact.findUnique({
        where: { id: contactId }
    });

    if (!contact) {
        logger.error(`Cannot send notification: Contact ${contactId} not found`);
        return;
    }

    const { subject, text, body } = messageData;
    let sent = false;

    
    if (contact.email) {
        try {
            await emailService.sendEmail(contact.email, subject || 'Message from CareOps', text || body);
            sent = true;
            logger.info(`Notification sent via Email to ${contact.email}`);
        } catch (error) {
            logger.warn(`Email failed for ${contact.email}, falling back to SMS if possible: ${error.message}`);
        }
    }

    
    if (!sent && contact.phone) {
        try {
            await smsService.sendSms(contact.phone, text || body);
            sent = true;
            logger.info(`Notification sent via SMS to ${contact.phone}`);
        } catch (error) {
            logger.error(`SMS fallback also failed for ${contact.phone}: ${error.message}`);
        }
    }

    if (!sent) {
        logger.error(`Failed to send notification to contact ${contactId}: No active channels or all failed.`);
    }

    return sent;
};
