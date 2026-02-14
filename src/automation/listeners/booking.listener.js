import eventBus from '../eventBus.js';
import eventTypes from '../eventTypes.js';
import prisma from '../../config/database.js';
import inventoryService from '../../modules/inventory/inventory.service.js';

const initBookingListener = () => {
    eventBus.on(eventTypes.BOOKING_CREATED, async ({ booking, serviceId }) => {
        console.log('DEBUG: Listener received BOOKING_CREATED event', { bookingId: booking.id, serviceId });

        try {
            
            const forms = await prisma.form.findMany({
                where: {
                    serviceTypes: {
                        some: { id: serviceId }
                    }
                }
            });

            if (forms.length > 0) {
                console.log(`Found ${forms.length} forms to send for booking ${booking.id}`);
                
                forms.forEach(form => {
                    console.log(`[AUTOMATION] Sending Form "${form.title}" (ID: ${form.id}) to Contact ${booking.contactId}`);
                });
            } else {
                console.log('No forms linked to this service.');
            }

            
            console.log(`[AUTOMATION] Sending Booking Confirmation for "${booking.title}" to Contact ${booking.contactId}`);

            
            await inventoryService.subtractUsageForBooking(booking.workspaceId);
            console.log(`[AUTOMATION] Updated inventory usage for booking ${booking.id}`);

        } catch (error) {
            console.error('Error in booking listener:', error);
        }
    });

    eventBus.on(eventTypes.INVENTORY_LOW, (item) => {
        console.log(`[AUTOMATION] ALERT: Inventory Low for "${item.name}" (Quantity: ${item.quantity}, Threshold: ${item.threshold})`);
    });
};

export default initBookingListener;
