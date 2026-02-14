import logger from '../utils/logger.js';
import prisma from '../config/database.js';
import { shouldAutomate } from '../utils/automation.js';
import { sendNotification } from '../utils/communication.js';
import { addHours, subHours } from 'date-fns';

const runReminderJob = async () => {
    logger.info('Running 24-hour booking reminder job...');

    const now = new Date();
    const tomorrow = addHours(now, 24);
    const windowStart = subHours(tomorrow, 1); 
    const windowEnd = addHours(tomorrow, 1);   

    try {
        const upcomingBookings = await prisma.booking.findMany({
            where: {
                startTime: {
                    gte: windowStart,
                    lte: windowEnd
                },
                reminderSent: false,
                status: 'CONFIRMED'
            },
            include: { contact: true }
        });

        logger.info(`Found ${upcomingBookings.length} bookings for reminders`);

        for (const booking of upcomingBookings) {
            if (booking.contactId) {
                const canAutomate = await shouldAutomate(booking.contactId);
                if (!canAutomate) {
                    logger.info(`Skipping reminder for contact ${booking.contactId} (Manual Mode)`);
                    continue;
                }

                if (booking.contact.email || booking.contact.phone) {
                    await sendNotification(booking.contact.id, booking.workspaceId, {
                        subject: 'Reminder: Upcoming Appointment',
                        body: `Hi ${booking.contact.firstName}, this is a reminder for your booking: ${booking.title} tomorrow.`
                    });

                    await prisma.booking.update({
                        where: { id: booking.id },
                        data: { reminderSent: true }
                    });

                    logger.info(`Sent reminder for booking ${booking.id}`);
                }
            }
        }
    } catch (error) {
        logger.error('Error running reminder job', error);
    }
};

export default runReminderJob;
