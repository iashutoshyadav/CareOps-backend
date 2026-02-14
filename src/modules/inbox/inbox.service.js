import prisma from '../../config/database.js';
import socketService from '../../utils/socket.js';


const getMessages = async (userId) => {
    return prisma.message.findMany({
        where: {
            OR: [
                { receiverId: userId },
                { senderId: userId }
            ]
        },
        include: {
            sender: { select: { name: true, email: true } },
            contact: true
        },
        orderBy: { createdAt: 'desc' }
    });
};

const sendMessage = async (messageBody, senderId, workspaceId) => {
    
    const message = await prisma.message.create({
        data: {
            ...messageBody,
            senderId,
            workspaceId
        },
        include: {
            sender: { select: { name: true, email: true, role: true } },
            contact: true
        }
    });

    
    if (message.contactId && ['ADMIN', 'USER', 'STAFF'].includes(message.sender.role)) {
        await prisma.contact.update({
            where: { id: message.contactId },
            data: { isManualMode: true }
        });

        
        socketService.emitToWorkspace(workspaceId, 'MANUAL_MODE_ACTIVATED', {
            contactId: message.contactId
        });
    }

    socketService.emitToWorkspace(workspaceId, 'MESSAGE_RECEIVED', message);
    return message;
};


export default {
    getMessages,
    sendMessage,
};

