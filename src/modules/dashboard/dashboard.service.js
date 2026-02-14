import prisma from '../../config/database.js';
import { startOfDay, endOfDay, subHours } from 'date-fns';

const getStats = async (workspaceId, user) => {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const yesterday = subHours(new Date(), 24);
    const isStaff = user.role !== 'ADMIN';
    const staffId = isStaff ? user.id : undefined;

    
    const [
        bookingsToday,
        newContacts,
        activeStaff,
        lowInventoryItems,
        upcomingBookings,
        recentBookings,
        recentContacts,
        recentSubmissions
    ] = await Promise.all([
        
        prisma.booking.count({
            where: {
                workspaceId,
                staffId,
                startTime: {
                    gte: todayStart,
                    lte: todayEnd
                },
                status: { not: 'CANCELLED' }
            }
        }),
        
        !isStaff ? prisma.contact.count({
            where: {
                workspaceId,
                createdAt: { gte: yesterday }
            }
        }) : 0,
        
        !isStaff ? prisma.user.count({
            where: {
                workspaceId,
                
            }
        }) : 0,
        
        prisma.inventoryItem.findMany({
            where: { workspaceId },
            select: { id: true, name: true, quantity: true, threshold: true, usagePerBooking: true }
        }),
        
        prisma.booking.findMany({
            where: {
                workspaceId,
                staffId,
                startTime: { gte: new Date() },
                status: { in: ['CONFIRMED', 'PENDING'] }
            },
            take: 5,
            orderBy: { startTime: 'asc' },
            include: { contact: true }
        }),
        
        prisma.booking.findMany({
            where: { workspaceId, staffId },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { contact: true }
        }),
        
        !isStaff ? prisma.contact.findMany({
            where: { workspaceId },
            take: 5,
            orderBy: { createdAt: 'desc' }
        }) : [],
        
        prisma.formSubmission.findMany({
            where: {
                form: { workspaceId },
                contact: isStaff ? { bookings: { some: { staffId } } } : undefined
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { form: true, contact: true }
        })
    ]);

    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const futureBookings = await prisma.booking.findMany({
        where: {
            workspaceId,
            startTime: { gte: new Date(), lte: sevenDaysFromNow },
            status: 'CONFIRMED'
        }
    });

    const forecastAlerts = lowInventoryItems.map(item => {
        const projectedUsage = futureBookings.length * item.usagePerBooking;
        const projectedQuantity = item.quantity - projectedUsage;
        if (projectedQuantity < item.threshold && projectedQuantity < item.quantity) {
            return {
                name: item.name,
                projectedQuantity,
                usageCount: futureBookings.length
            };
        }
        return null;
    }).filter(Boolean);

    
    const lowStockAlerts = lowInventoryItems.filter(item => item.quantity <= item.threshold);

    
    const activity = [
        ...recentBookings.map(b => ({
            id: `booking-${b.id}`,
            type: 'booking',
            text: `Booking ${b.status.toLowerCase()}: ${b.contact?.firstName} ${b.contact?.lastName || ''}`,
            time: b.createdAt
        })),
        ...recentContacts.map(c => ({
            id: `contact-${c.id}`,
            type: 'contact',
            text: `New contact: ${c.firstName} ${c.lastName}`,
            time: c.createdAt
        })),
        ...recentSubmissions.map(s => ({
            id: `form-${s.id}`,
            type: 'form',
            text: `Form submitted: ${s.form.title}`,
            time: s.createdAt
        }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    
    const alerts = [];
    if (lowStockAlerts.length > 0) {
        alerts.push({
            id: 'alert-inventory',
            type: 'inventory',
            message: `${lowStockAlerts.length} Items Below Threshold`,
            link: '/inventory',
            count: lowStockAlerts.length
        });
    }

    if (forecastAlerts.length > 0 && !isStaff) {
        alerts.push({
            id: 'alert-forecast',
            type: 'forecast',
            message: `${forecastAlerts.length} Items Running Low Next Week`,
            link: '/inventory',
            count: forecastAlerts.length,
            details: forecastAlerts
        });
    }

    
    const pendingBookingsCount = await prisma.booking.count({
        where: { workspaceId, staffId, status: 'PENDING' }
    });
    if (pendingBookingsCount > 0) {
        alerts.push({
            id: 'alert-booking',
            type: 'booking',
            message: `${pendingBookingsCount} Pending Actions`,
            link: '/bookings',
            count: pendingBookingsCount
        });
    }


    return {
        metrics: {
            bookingsToday,
            newInquiries: !isStaff ? newContacts : 0,
            pendingForms: 0,
            activeStaff: !isStaff ? activeStaff : 1
        },
        alerts,
        upcoming: upcomingBookings.map(b => ({
            id: b.id,
            time: b.startTime,
            name: b.contact ? `${b.contact.firstName} ${b.contact.lastName}` : 'Unknown',
            type: b.title,
            status: b.status.toLowerCase()
        })),
        activity,
        bookingStats: {
            completed: await prisma.booking.count({ where: { workspaceId, staffId, status: 'COMPLETED' } }),
            upcoming: await prisma.booking.count({
                where: {
                    workspaceId,
                    staffId,
                    status: { in: ['CONFIRMED', 'PENDING'] },
                    startTime: { gte: new Date() }
                }
            }),
            noShows: 0
        }
    };
};

export default {
    getStats,
};