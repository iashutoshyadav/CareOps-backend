import cron from 'node-cron';
import logger from '../utils/logger.js';
import runReminderJob from './reminder.job.js';
import runInventoryJob from './inventory.job.js';
import runFormReminderJob from './form.job.js';
import runUnansweredMessageAlertJob from './alert.job.js';

const initScheduler = () => {
    cron.schedule('0 0 * * *', () => {
        logger.info('Executing daily jobs');
        runReminderJob();
        runInventoryJob();
        runFormReminderJob();
        runUnansweredMessageAlertJob();
    });
};

export default initScheduler;
