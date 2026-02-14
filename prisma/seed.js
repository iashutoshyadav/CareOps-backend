import prisma from '../src/config/database.js';
import { hashPassword } from '../src/utils/password.js';

async function main() {
    console.log('Seeding database...');
    const hashedPassword = await hashPassword('password123');

    const user = await prisma.user.create({
        data: {
            email: 'admin@careops.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
            isEmailVerified: true,
        }
    });

    const workspace = await prisma.workspace.create({
        data: {
            name: 'Main Clinic',
            users: { connect: { id: user.id } }
        }
    });

    await prisma.user.update({
        where: { id: user.id },
        data: { workspaceId: workspace.id }
    });

    const contact = await prisma.contact.create({
        data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            type: 'PATIENT',
            workspaceId: workspace.id
        }
    });

    await prisma.inventoryItem.create({
        data: {
            name: 'Bandages',
            quantity: 100,
            threshold: 20,
            workspaceId: workspace.id
        }
    });

    console.log('Database seeded!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
