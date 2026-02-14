import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current directory:', __dirname);

const emailServicePath = path.resolve(__dirname, '../integrations/email/email.service.js');
console.log(`Checking emailServicePath: ${emailServicePath}`);
console.log(`Exists: ${fs.existsSync(emailServicePath)}`);

const smsServicePath = path.resolve(__dirname, '../integrations/sms/sms.service.js');
console.log(`Checking smsServicePath: ${smsServicePath}`);
console.log(`Exists: ${fs.existsSync(smsServicePath)}`);
