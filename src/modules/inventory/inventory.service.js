import prisma from '../../config/database.js';
import eventBus from '../../automation/eventBus.js';
import eventTypes from '../../automation/eventTypes.js';

const createItem = async (itemBody, workspaceId) => {
    const item = await prisma.inventoryItem.create({
        data: {
            ...itemBody,
            workspaceId
        }
    });

    if (item.quantity < item.threshold) {
        eventBus.emit(eventTypes.INVENTORY_LOW, item);
    }

    return item;
};

const getItems = async (workspaceId) => {
    return prisma.inventoryItem.findMany({
        where: { workspaceId }
    });
};

const updateItem = async (itemId, updateBody) => {
    const item = await prisma.inventoryItem.update({
        where: { id: itemId },
        data: updateBody
    });

    if (item.quantity < item.threshold) {
        eventBus.emit(eventTypes.INVENTORY_LOW, item);
    }

    return item;
};

const deleteItem = async (itemId) => {
    return prisma.inventoryItem.delete({
        where: { id: itemId }
    });
};

const subtractUsageForBooking = async (workspaceId) => {
    const itemsToUpdate = await prisma.inventoryItem.findMany({
        where: {
            workspaceId,
            usagePerBooking: { gt: 0 },
            quantity: { gt: 0 }
        }
    });

    for (const item of itemsToUpdate) {
        const newQuantity = Math.max(0, item.quantity - item.usagePerBooking);
        const updatedItem = await prisma.inventoryItem.update({
            where: { id: item.id },
            data: { quantity: newQuantity }
        });

        if (newQuantity < updatedItem.threshold) {
            eventBus.emit(eventTypes.INVENTORY_LOW, updatedItem);
        }
    }
};

const getForecast = async (workspaceId) => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const [items, futureBookings] = await Promise.all([
        prisma.inventoryItem.findMany({ where: { workspaceId } }),
        prisma.booking.findMany({
            where: {
                workspaceId,
                startTime: { gte: new Date(), lte: sevenDaysFromNow },
                status: 'CONFIRMED'
            }
        })
    ]);

    return items.map(item => {
        const projectedUsage = futureBookings.length * item.usagePerBooking;
        const projectedQuantity = item.quantity - projectedUsage;
        return {
            ...item,
            projectedQuantity,
            usageCount: futureBookings.length,
            isCritical: projectedQuantity < item.threshold
        };
    }).filter(item => item.isCritical);
};

export default {
    createItem,
    getItems,
    updateItem,
    deleteItem,
    subtractUsageForBooking,
    getForecast
};

