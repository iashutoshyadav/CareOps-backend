import prisma from '../../config/database.js';
import eventBus from '../../automation/eventBus.js';
import eventTypes from '../../automation/eventTypes.js';

const getInfo = async () => {
    return {
        appName: 'CareOps',
        version: '1.0.0',
        status: 'Operational'
    };
};

const getPublicFormById = async (id) => {
    return prisma.form.findUnique({
        where: { id },
        select: { id: true, title: true, description: true, schema: true }
    });
};

const submitForm = async (formId, submissionData, contactInfo) => {
    console.log(`DEBUG: submitForm called for id ${formId}`);
    const submission = await prisma.$transaction(async (tx) => {
        
        const form = await tx.form.findUnique({ where: { id: formId } });
        if (!form) throw new Error('Form not found');

        
        let contactId = null;
        if (contactInfo && contactInfo.email) {
            const contact = await tx.contact.upsert({
                where: {
                    workspaceId_email: {
                        workspaceId: form.workspaceId,
                        email: contactInfo.email
                    }
                },
                update: {
                    firstName: contactInfo.firstName,
                    lastName: contactInfo.lastName,
                    phone: contactInfo.phone,
                },
                create: {
                    workspaceId: form.workspaceId,
                    firstName: contactInfo.firstName || 'Unknown',
                    lastName: contactInfo.lastName || 'User',
                    email: contactInfo.email,
                    phone: contactInfo.phone || '',
                    type: 'PATIENT' 
                }
            });
            contactId = contact.id;
        }

        
        const sub = await tx.formSubmission.create({
            data: {
                formId,
                contactId,
                data: submissionData
            },
            include: { form: true } 
        });
        return sub;
    });

    eventBus.emit(eventTypes.FORM_SUBMITTED, submission);
    return submission;
};

const getBookingPageInfo = async (slug) => {
    return prisma.workspace.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            slug: true,
            serviceTypes: {
                where: { isActive: true },
                select: { id: true, name: true, duration: true, price: true, description: true }
            }
        }
    });
};

const getAvailableSlots = async (workspaceId, serviceId, date) => {
    
    
    const slots = [];
    const startHour = 9;
    const endHour = 17;

    for (let h = startHour; h < endHour; h++) {
        slots.push(`${h.toString().padStart(2, '0')}:00`);
        slots.push(`${h.toString().padStart(2, '0')}:30`);
    }

    
    

    return slots;
};

const handleIncomingMessage = async (workspaceId, senderInfo, content) => {
    
    let contact = await prisma.contact.findFirst({
        where: {
            workspaceId,
            OR: [
                { email: senderInfo.email },
                { phone: senderInfo.phone }
            ]
        }
    });

    if (!contact) {
        contact = await prisma.contact.create({
            data: {
                firstName: senderInfo.name || 'Unknown',
                lastName: 'Contact',
                email: senderInfo.email,
                phone: senderInfo.phone,
                workspaceId
            }
        });
    }

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { users: { take: 1 } }
    });

    const receiverId = workspace.users[0]?.id;

    return prisma.message.create({
        data: {
            content,
            workspaceId,
            senderId: receiverId,
            receiverId: receiverId,
            read: false
        }
    });
};

const submitBooking = async (slug, bookingData, contactInfo) => {
    
    

    const result = await prisma.$transaction(async (tx) => {
        
        const workspace = await tx.workspace.findUnique({
            where: { slug },
            include: { serviceTypes: true } 
        });

        if (!workspace) throw new Error('Workspace not found');

        const service = workspace.serviceTypes.find(s => s.id === bookingData.serviceTypeId);
        if (!service) throw new Error('Service type not found');

        
        const start = new Date(bookingData.startTime);
        const end = new Date(start.getTime() + service.duration * 60000);

        
        let contactId = null;
        if (contactInfo && contactInfo.email) {
            const contact = await tx.contact.upsert({
                where: {
                    workspaceId_email: {
                        workspaceId: workspace.id,
                        email: contactInfo.email
                    }
                },
                update: {
                    firstName: contactInfo.firstName,
                    lastName: contactInfo.lastName,
                    phone: contactInfo.phone,
                },
                create: {
                    workspaceId: workspace.id,
                    firstName: contactInfo.firstName || 'Unknown',
                    lastName: contactInfo.lastName || 'User',
                    email: contactInfo.email,
                    phone: contactInfo.phone || '',
                    type: 'PATIENT'
                }
            });
            contactId = contact.id;
        }

        
        const booking = await tx.booking.create({
            data: {
                title: service.name,
                startTime: start,
                endTime: end,
                workspaceId: workspace.id,
                contactId,
                status: 'PENDING'
            }
        });

        return { booking, serviceId: service.id, contactId: contactId };
    });

    if (result && result.booking) {
        
        eventBus.emit(eventTypes.BOOKING_CREATED, result);
        return result.booking;
    }

    return null;
};


export default {
    getInfo,
    getPublicFormById,
    submitForm,
    submitBooking,
    getBookingPageInfo,
    getAvailableSlots,
    handleIncomingMessage,
};



