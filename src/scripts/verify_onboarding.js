import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000/v1';

const runVerification = async () => {
    try {
        console.log('1. Logging in...');

        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@careops.com',
            password: 'password123'
        });
        const { tokens, user } = loginRes.data.data;
        const accessToken = tokens.access.token;
        console.log('   Login successful. Token acquired.');

        const config = {
            headers: { Authorization: `Bearer ${accessToken}` }
        };

        console.log('2. Creating Service...');
        const serviceRes = await axios.post(`${API_URL}/services`, {
            name: 'General Consultation',
            duration: 30,
            price: 50,
            description: 'Standard checkup'
        }, config);
        console.log('   Service created:', serviceRes.data.data.service.name);

        console.log('3. Setting Availability...');
        const availabilityData = [
            { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
            { dayOfWeek: 2, startTime: '09:00', endTime: '12:00', isActive: true }
        ];
        const availRes = await axios.put(`${API_URL}/workspaces/availability`, availabilityData, config);
        console.log('   Availability updated. Slots count:', availRes.data.data.availability.length);

        console.log('4. Saving Integration...');
        const integRes = await axios.post(`${API_URL}/integrations`, {
            provider: 'SENDGRID',
            credentials: { apiKey: 'SG.dummy_key' }
        }, config);
        console.log('   Integration saved:', integRes.data.data.integration.provider);

        console.log('5. Verifying Workspace Data...');
        const workspaceRes = await axios.get(`${API_URL}/workspaces`, config);
        const ws = workspaceRes.data.data.workspaces[0];


        console.log(`   Workspace: ${ws.name}`);
        console.log(`   Services: ${ws.serviceTypes.length}`);
        console.log(`   Operating Hours: ${ws.operatingHours.length}`);
        console.log(`   Integrations: ${ws.integrations.length}`);

        if (ws.serviceTypes.length > 0 && ws.operatingHours.length >= 2 && ws.integrations.length > 0) {
            console.log('\n✅ VERIFICATION PASSED: Onboarding APIs are working correctly.');
        } else {
            console.error('\n❌ VERIFICATION FAILED: Data mismatch.');
            process.exit(1);
        }

    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
        console.error('\n❌ VERIFICATION FAILED:', errorMsg);
        fs.writeFileSync('verification_error.log', errorMsg);
        process.exit(1);
    }
};

runVerification();
