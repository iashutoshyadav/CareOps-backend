import 'dotenv/config';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = process.env.BACKEND_URL || 'http://localhost:5000/v1';


const testUser = {
    email: 'testowner@careops.com',
    password: 'Password123!',
    businessName: 'Test Clinic',
    role: 'ADMIN'
};

const testStaff = {
    email: 'staff@careops.com',
    name: 'Staff Member'
};

const results = {
    phase1: [],
    phase2: [],
    phase3: [],
    phase4: [],
    phase5: [],
    phase6: []
};

async function runTests() {
    console.log('Starting CareOps Automated Tests...');

    let token;
    let slug = 'test-clinic';
    let serviceId;

    try {
        await cleanup();


        console.log('\n--- Phase 1: Authentication & Setup ---');
        token = await testAuth();
        if (!token) return;

        const returnedSlug = await testWorkspace(token);
        if (returnedSlug) slug = returnedSlug;

        await testStaffCreation(token);
        await testIntegrations(token);


        console.log('\n--- Phase 2: Public Forms & Contacts ---');
        const formId = await testFormCreation(token);
        if (formId) {
            await testPublicFormSubmission(formId);
            await testInbox(token);
            await testStaffReply(token);
        }


        console.log('\n--- Phase 3: Booking System ---');
        serviceId = await testServiceCreation(token);
        if (serviceId) {
            await testPublicBookingPage(slug);
            const today = new Date().toISOString();
            await testBookingSubmission(slug, serviceId, today);
            await testBookingSubmission(slug, serviceId, today);
            const bookingId = await testStaffViewBookings(token);
            if (bookingId) {
                await testStaffUpdateBooking(token, bookingId);
            }
        }


        console.log('\n--- Phase 4: Forms System ---');
        const fileUrl = await testFormUpload(token);
        const linkedFormId = await testFormLinking(token, serviceId, fileUrl);
        await testFormAutomation(slug, serviceId);
        if (linkedFormId) {
            await testFormCompletion(linkedFormId);
        }


        console.log('\n--- Phase 5: Inventory System ---');
        const itemId = await testInventoryCreation(token);
        if (itemId) {
            await testInventoryUsage(token, itemId, slug, serviceId);
            await testLowInventoryAlert(token, itemId, slug, serviceId);
        }


        console.log('\n--- Phase 6: Dashboard & Automation ---');
        await testDashboardStats(token, 'ADMIN');
        const staffToken = await testStaffLogin();
        if (staffToken) {
            await testDashboardStats(staffToken, 'STAFF');
        }
        await testAutomationVerification(token);

    } catch (error) {
        console.error('CRITICAL ERROR in test runner:', error.message);
    } finally {
        console.log('\n--- Test Results ---');
        console.log(JSON.stringify(results, null, 2));

        const hasFailures = Object.values(results).some(phase =>
            phase.some(test => test.status === 'FAIL')
        );
        process.exit(hasFailures ? 1 : 0);
    }
}


async function cleanup() {
    console.log('Cleaning up test data...');
    try {
        await prisma.message.deleteMany({});
        await prisma.booking.deleteMany({});
        await prisma.formSubmission.deleteMany({});
        await prisma.contact.deleteMany({});
        await prisma.inventoryItem.deleteMany({});
        await prisma.serviceType.deleteMany({});
        await prisma.operatingHours.deleteMany({});
        await prisma.integrationConfig.deleteMany({});
        await prisma.workspace.deleteMany({});
        await prisma.user.deleteMany({});
    } catch (e) {
        console.log('Cleanup error (ignorable):', e.message);
    }
}

async function testAuth() {
    try {

        try {
            const registerRes = await axios.post(`${API_URL}/auth/register`, {
                email: testUser.email,
                password: testUser.password,
                name: 'Test Owner',
                role: testUser.role
            });

            if (registerRes.status === 201) {
                results.phase1.push({ test: 'Owner Registration', status: 'PASS' });
                console.log(' Owner Registration Passed');
            }
        } catch (e) {
            results.phase1.push({ test: 'Owner Registration', status: 'FAIL', error: e.message });
            console.error(' Owner Registration Failed', e.message);
            return null;
        }


        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });

        if (loginRes.status === 200 && loginRes.data.data.tokens) {
            results.phase1.push({ test: 'Owner Login', status: 'PASS' });
            console.log(' Owner Login Passed');
            return loginRes.data.data.tokens.access.token;
        } else {
            results.phase1.push({ test: 'Owner Login', status: 'FAIL' });
            console.error(' Owner Login Failed');
            return null;
        }

    } catch (error) {
        results.phase1.push({ test: 'Auth Flow', status: 'FAIL', error: error.message });
        console.error(' Phase 1 Auth Failed', error.message);
        return null;
    }
}

async function testWorkspace(token) {
    try {
        const res = await axios.post(`${API_URL}/workspace`, {
            name: testUser.businessName
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (res.status === 201) {
            results.phase1.push({ test: 'Workspace Creation', status: 'PASS' });
            console.log(' Workspace Creation Passed');
            return res.data.data.workspace.slug;
        }
    } catch (e) {
        results.phase1.push({ test: 'Workspace Creation', status: 'FAIL', error: e.message });
        console.error(' Workspace Creation Failed', e.message);
    }
}

async function testStaffCreation(token) {
    try {
        const res = await axios.post(`${API_URL}/staff`, {
            email: testStaff.email,
            name: testStaff.name
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (res.status === 201) {
            results.phase1.push({ test: 'Staff Creation', status: 'PASS' });
            console.log(' Staff Creation Passed');
        }
    } catch (e) {
        results.phase1.push({ test: 'Staff Creation', status: 'FAIL', error: e.message });
        console.error(' Staff Creation Failed', e.message);
    }
}

async function testIntegrations(token) {
    try {

        const emailRes = await axios.post(`${API_URL}/integrations`, {
            provider: 'SENDGRID',
            credentials: { apiKey: 'SG.mock123' }
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (emailRes.status === 200) {
            results.phase1.push({ test: 'Email Integration', status: 'PASS' });
            console.log(' Email Integration Passed');
        }
    } catch (e) {
        results.phase1.push({ test: 'Email Integration', status: 'FAIL', error: e.message });
        console.error(' Email Integration Failed', e.message);
    }
}

async function testFormCreation(token) {
    try {
        const res = await axios.post(`${API_URL}/forms`, {
            title: 'Contact Us',
            type: 'JSON',
            schema: { fields: [] }
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (res.status === 201) {
            results.phase2.push({ test: 'Form Creation', status: 'PASS' });
            console.log(' Form Creation Passed');
            return res.data.data.form.id;
        }
    } catch (e) {
        results.phase2.push({ test: 'Form Creation', status: 'FAIL', error: e.message });
        console.error(' Form Creation Failed', e.message);
        return null;
    }
}

async function testPublicFormSubmission(formId) {
    try {
        const res = await axios.post(`${API_URL}/public/forms/${formId}/submit`, {
            data: { message: 'Hello CareOps!' },
            contactInfo: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '1234567890'
            }
        });

        if (res.status === 201) {
            results.phase2.push({ test: 'Public Form Submission', status: 'PASS' });
            console.log(' Public Form Submission Passed');
        }
    } catch (e) {
        results.phase2.push({ test: 'Public Form Submission', status: 'FAIL', error: e.message });
        console.error(' Public Form Submission Failed', e.message);
    }
}

async function testInbox(token) {
    try {

        await new Promise(resolve => setTimeout(resolve, 10000));

        const res = await axios.get(`${API_URL}/inbox`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 200 && res.data.data.messages.length > 0) {
            results.phase2.push({ test: 'Inbox View', status: 'PASS' });
            console.log(' Inbox View Passed');
        } else {
            results.phase2.push({ test: 'Inbox View', status: 'FAIL', error: 'No messages found' });
            console.error(' Inbox View Failed: No messages found');
        }
    } catch (e) {
        results.phase2.push({ test: 'Inbox View', status: 'FAIL', error: e.message });
        console.error(' Inbox View Failed', e.message);
    }
}

async function testStaffReply(token) {
    try {
        const inboxRes = await axios.get(`${API_URL}/inbox`, { headers: { Authorization: `Bearer ${token}` } });
        const messages = inboxRes.data.data.messages;
        const contactId = messages[0]?.contactId;

        if (!contactId) {
            throw new Error('No contact found to reply to');
        }

        const res = await axios.post(`${API_URL}/inbox`, {
            content: "Here is your reply!",
            contactId: contactId,
            receiverId: messages[0].senderId === messages[0].receiverId ? messages[0].senderId : messages[0].senderId

        }, { headers: { Authorization: `Bearer ${token}` } });

        if (res.status === 201) {
            results.phase2.push({ test: 'Staff Reply', status: 'PASS' });
            console.log(' Staff Reply Passed');
        }
    } catch (e) {
        results.phase2.push({ test: 'Staff Reply', status: 'FAIL', error: e.message });
        console.error(' Staff Reply Failed', e.message);
    }
}



async function testServiceCreation(token) {
    try {
        const res = await axios.post(`${API_URL}/services`, {
            name: 'General Consultation',
            duration: 30,
            price: 50,
            description: 'Standard checkup'
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (res.status === 201) {
            results.phase3.push({ test: 'Service Creation', status: 'PASS' });
            console.log(' Service Creation Passed');
            return res.data.data.service.id;
        }
    } catch (e) {
        results.phase3.push({ test: 'Service Creation', status: 'FAIL', error: e.message });
        console.error(' Service Creation Failed', e.message);
        return null;
    }
}

async function testPublicBookingPage(slug) {
    try {
        const res = await axios.get(`${API_URL}/public/book/${slug}`);
        if (res.status === 200 && res.data.data.info) {
            results.phase3.push({ test: 'Public Booking Page', status: 'PASS' });
            console.log(' Public Booking Page Passed');
        }
    } catch (e) {
        results.phase3.push({ test: 'Public Booking Page', status: 'FAIL', error: e.message });
        console.error(' Public Booking Page Failed', e.message);
    }
}

async function testBookingSubmission(slug, serviceId, startTime) {
    try {
        const res = await axios.post(`${API_URL}/public/book/${slug}/confirm`, {
            data: {
                serviceTypeId: serviceId,
                startTime: startTime
            },
            contactInfo: {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane@example.com',
                phone: '0987654321'
            }
        });

        if (res.status === 201) {
            results.phase3.push({ test: 'Booking Submission', status: 'PASS' });
            console.log(' Booking Submission Passed');
        }
    } catch (e) {
        results.phase3.push({ test: 'Booking Submission', status: 'FAIL', error: e.message });
        console.error(' Booking Submission Failed', e.message);
    }
}

async function testStaffViewBookings(token) {
    try {
        const res = await axios.get(`${API_URL}/bookings`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 200 && res.data.data.bookings.length > 0) {
            results.phase3.push({ test: 'Staff View Bookings', status: 'PASS' });
            console.log(' Staff View Bookings Passed');
            return res.data.data.bookings[0].id;
        } else {
            results.phase3.push({ test: 'Staff View Bookings', status: 'FAIL', error: 'No bookings found' });
            console.error(' Staff View Bookings Failed: No bookings found');
            return null;
        }
    } catch (e) {
        results.phase3.push({ test: 'Staff View Bookings', status: 'FAIL', error: e.message });
        console.error(' Staff View Bookings Failed', e.message);
        return null;
    }
}

async function testStaffUpdateBooking(token, bookingId) {
    try {
        const res = await axios.patch(`${API_URL}/bookings/${bookingId}/status`, {
            status: 'CONFIRMED'
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (res.status === 200 && res.data.data.booking.status === 'CONFIRMED') {
            results.phase3.push({ test: 'Staff Update Booking', status: 'PASS' });
            console.log(' Staff Update Booking Passed');
        }
    } catch (e) {
        results.phase3.push({ test: 'Staff Update Booking', status: 'FAIL', error: e.message });
        console.error(' Staff Update Booking Failed', e.message);
    }
}

async function testFormUpload(token) {

    console.log('⚠️ Skipping actual file upload in automated runner (using mock URL)');
    return 'https://example.com/dummy.pdf';
}

async function testFormLinking(token, serviceId, fileUrl) {
    try {
        const res = await axios.post(`${API_URL}/forms`, {
            title: 'Pre-Visit Questionnaire',
            type: 'PDF',
            fileUrl: fileUrl,
            serviceTypeIds: [serviceId]
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (res.status === 201) {
            results.phase4.push({ test: 'Form Linking', status: 'PASS' });
            console.log(' Form Linking Passed');
            return res.data.data.form.id;
        }
    } catch (e) {
        results.phase4.push({ test: 'Form Linking', status: 'FAIL', error: e.message });
        console.error(' Form Linking Failed', e.message);
        return null;
    }
}

async function testFormAutomation(slug, serviceId) {
    try {
        const res = await axios.post(`${API_URL}/public/book/${slug}/confirm`, {
            data: {
                serviceTypeId: serviceId,
                startTime: new Date(Date.now() + 86400000).toISOString()
            },
            contactInfo: {
                firstName: 'Auto',
                lastName: 'Mate',
                email: 'automate@example.com',
                phone: '1112223333'
            }
        });

        if (res.status === 201) {
            results.phase4.push({ test: 'Form Automation Trigger', status: 'PASS' });
            console.log(' Form Automation Trigger Passed (Check server logs for "Sending Form")');
        }
    } catch (e) {
        results.phase4.push({ test: 'Form Automation Trigger', status: 'FAIL', error: e.message });
        console.error(' Form Automation Trigger Failed', e.message);
    }
}

async function testFormCompletion(formId) {
    try {
        const res = await axios.post(`${API_URL}/public/forms/${formId}/submit`, {
            data: { answers: "All good" },
            contactInfo: {
                firstName: 'Auto',
                lastName: 'Mate',
                email: 'automate@example.com'
            }
        });

        if (res.status === 201) {
            results.phase4.push({ test: 'Form Completion', status: 'PASS' });
            console.log(' Form Completion Passed');
        }
    } catch (e) {
        results.phase4.push({ test: 'Form Completion', status: 'FAIL', error: e.message });
        console.error(' Form Completion Failed', e.message);
    }
}

async function testInventoryCreation(token) {
    try {
        const res = await axios.post(`${API_URL}/inventory`, {
            name: 'Disposable Gloves',
            quantity: 100,
            threshold: 10,
            usagePerBooking: 2
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (res.status === 201) {
            results.phase5.push({ test: 'Inventory Creation', status: 'PASS' });
            console.log(' Inventory Creation Passed');
            return res.data.data.item.id;
        }
    } catch (e) {
        results.phase5.push({ test: 'Inventory Creation', status: 'FAIL', error: e.message });
        console.error(' Inventory Creation Failed', e.message);
        return null;
    }
}

async function testInventoryUsage(token, itemId, slug, serviceId) {
    try {
        console.log('Creating booking to trigger inventory usage...');
        await makeBooking(slug, serviceId);


        await new Promise(resolve => setTimeout(resolve, 2000));

        const res = await axios.get(`${API_URL}/inventory`, { headers: { Authorization: `Bearer ${token}` } });
        const item = res.data.data.items.find(i => i.id === itemId);

        if (item && item.quantity === 98) {
            results.phase5.push({ test: 'Inventory Usage', status: 'PASS' });
            console.log(' Inventory Usage Passed (100 -> 98)');
        } else {
            results.phase5.push({ test: 'Inventory Usage', status: 'FAIL', error: `Expected 98, got ${item?.quantity}` });
            console.error(` Inventory Usage Failed. Expected 98, got ${item?.quantity}`);
        }
    } catch (e) {
        results.phase5.push({ test: 'Inventory Usage', status: 'FAIL', error: e.message });
        console.error(' Inventory Usage Failed', e.message);
    }
}

async function testLowInventoryAlert(token, itemId, slug, serviceId) {
    try {
        console.log('Updating inventory to low level (11)...');
        await axios.patch(`${API_URL}/inventory/${itemId}`, {
            quantity: 11
        }, { headers: { Authorization: `Bearer ${token}` } });

        await makeBooking(slug, serviceId);


        await new Promise(resolve => setTimeout(resolve, 2000));

        const res = await axios.get(`${API_URL}/inventory`, { headers: { Authorization: `Bearer ${token}` } });
        const item = res.data.data.items.find(i => i.id === itemId);

        if (item && item.quantity === 9) {
            results.phase5.push({ test: 'Low Inventory Alert', status: 'PASS' });
            console.log(' Low Inventory Alert Passed (Quantity: 9, Check logs for ALERT)');
        } else {
            results.phase5.push({ test: 'Low Inventory Alert', status: 'FAIL', error: `Expected 9, got ${item?.quantity}` });
            console.error(` Low Inventory Alert Failed. quantity: ${item?.quantity}`);
        }
    } catch (e) {
        results.phase5.push({ test: 'Low Inventory Alert', status: 'FAIL', error: e.message });
        console.error(' Low Inventory Alert Failed', e.message);
    }
}

async function makeBooking(slug, serviceId) {
    return axios.post(`${API_URL}/public/book/${slug}/confirm`, {
        data: {
            serviceTypeId: serviceId,
            startTime: new Date(Date.now() + 172800000).toISOString()
        },
        contactInfo: {
            firstName: 'Inv',
            lastName: 'Entory',
            email: `inventory_${Date.now()}@example.com`,
            phone: `555${Math.floor(Math.random() * 9000000 + 1000000)}`
        }
    });
}

async function testDashboardStats(token, role) {
    try {
        const res = await axios.get(`${API_URL}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 200) {
            const stats = res.data.data.stats;
            if (role === 'ADMIN') {

                if (stats.metrics.bookingsToday >= 2) {
                    results.phase6.push({ test: `Owner Dashboard Stats`, status: 'PASS' });
                    console.log(' Owner Dashboard Stats Passed');
                } else {
                    results.phase6.push({ test: `Owner Dashboard Stats`, status: 'FAIL', error: `Expected >=2 bookings today, got ${stats.metrics.bookingsToday}` });
                    console.error(` Owner Dashboard Stats Failed. bookingsToday: ${stats.metrics.bookingsToday}`);
                }
            } else {

                if (stats.metrics.newInquiries === 0) {
                    results.phase6.push({ test: `Staff Dashboard Stats`, status: 'PASS' });
                    console.log(' Staff Dashboard Stats Passed (Limited View)');
                } else {
                    results.phase6.push({ test: `Staff Dashboard Stats`, status: 'FAIL', error: `Staff see inquiries which should be hidden` });
                    console.error(' Staff Dashboard Stats Failed (Role Restriction)');
                }
            }
        }
    } catch (e) {
        results.phase6.push({ test: `${role} Dashboard Stats`, status: 'FAIL', error: e.message });
        console.error(` ${role} Dashboard Stats Failed`, e.message);
    }
}

async function testStaffLogin() {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: testStaff.email,
            password: 'tempPassword123'
        });
        if (res.status === 200) {
            console.log(' Staff Login (test) Passed');
            return res.data.data.token;
        }
    } catch (e) {
        console.error(' Staff Login (test) Failed', e.message);
        return null;
    }
}

async function testAutomationVerification(token) {
    try {

        const res = await axios.get(`${API_URL}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const hasLowStockAlert = res.data.data.stats.alerts.some(a => a.type === 'inventory');

        if (hasLowStockAlert) {
            results.phase6.push({ test: 'Automation Engine Summary', status: 'PASS' });
            console.log(' Automation Engine Summary Passed (Low stock alert triggered)');
        } else {
            results.phase6.push({ test: 'Automation Engine Summary', status: 'FAIL', error: 'No inventory alert found in dashboard' });
            console.error(' Automation Engine Summary Failed (No alerts)');
        }
    } catch (e) {
        results.phase6.push({ test: 'Automation Engine Summary', status: 'FAIL', error: e.message });
        console.error(' Automation Engine Summary Failed', e.message);
    }
}


runTests();
