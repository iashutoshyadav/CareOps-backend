import prisma from '../../config/database.js';
import eventBus from '../../automation/eventBus.js';
import eventTypes from '../../automation/eventTypes.js';

const createContact = async (contactBody, workspaceId) => {
    const contact = await prisma.contact.create({
        data: {
            ...contactBody,
            workspaceId
        }
    });
    eventBus.emit(eventTypes.CONTACT_CREATED, contact);
    return contact;
};


const getContacts = async (workspaceId) => {
    return prisma.contact.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' }
    });
};

const updateContact = async (contactId, updateBody) => {
    return prisma.contact.update({
        where: { id: contactId },
        data: updateBody
    });
};

const deleteContact = async (contactId) => {
    return prisma.contact.delete({
        where: { id: contactId }
    });
};

export default {
    createContact,
    getContacts,
    updateContact,
    deleteContact
};

