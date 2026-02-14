
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    try {
        console.log('Starting cleanup...');

        
        
        console.log('Deleting AutomationLog...');
        try { await prisma.$executeRaw`TRUNCATE TABLE "AutomationLog" CASCADE`; } catch (e) { }

        console.log('Deleting FormSubmission...');
        await prisma.formSubmission.deleteMany({});

        console.log('Deleting Message...');
        await prisma.message.deleteMany({});

        console.log('Deleting Booking...');
        await prisma.booking.deleteMany({});

        console.log('Deleting Contact...');
        await prisma.contact.deleteMany({});

        console.log('Deleting Form...');
        await prisma.form.deleteMany({});

        console.log('Deleting ServiceType...');
        await prisma.serviceType.deleteMany({});

        console.log('Deleting OperatingHours...');
        await prisma.operatingHours.deleteMany({});

        console.log('Deleting IntegrationConfig...');
        await prisma.integrationConfig.deleteMany({});

        console.log('Deleting Workspace...');
        await prisma.workspace.deleteMany({});

        console.log('Deleting User...');
        await prisma.user.deleteMany({});

        console.log('Cleanup success');
    } catch (e) {
        console.error('Cleanup failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
