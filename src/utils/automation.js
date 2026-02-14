import prisma from '../config/database.js';


export const shouldAutomate = async (contactId) => {
    if (!contactId) return true;

    const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        select: { isManualMode: true }
    });

    return contact ? !contact.isManualMode : true;
};
