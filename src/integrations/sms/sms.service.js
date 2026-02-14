import logger from '../../utils/logger.js';

const sendSms = async (to, body) => {
    logger.info(`Sending SMS to ${to}: ${body}`);
};

export default { sendSms };
