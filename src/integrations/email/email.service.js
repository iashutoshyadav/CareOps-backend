import config from '../../config/env.js';
import logger from '../../utils/logger.js';

const sendEmail = async (to, subject, text) => {
    if (config.env === 'development') {
        logger.info(`[Email Mock] To: ${to}, Subject: ${subject}, Text: ${text}`);
        return;
    }
};

export default {
    sendEmail,
};
