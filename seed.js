import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
    const hashedPassword = await bcrypt.hash('password123', 8);
    const user = await prisma.user.upsert({
        where: { email: 'admin@careops.com' },
        update: { password: hashedPassword },
        create: {
            email: 'admin@careops.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN'
        }
    });
    console.log('Seeded user:', user.email);
}

seed()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
