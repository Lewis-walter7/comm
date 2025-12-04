import { io, Socket } from 'socket.io-client';

let documentSocket: Socket | null = null;
let chatSocket: Socket | null = null;

export const getDocumentSocket = () => {
    if (!documentSocket) {
        const token = localStorage.getItem('accessToken');
        documentSocket = io(`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000'}/documents`, {
            auth: { token },
            transports: ['websocket'],
        });
    }
    return documentSocket;
};

export const getChatSocket = () => {
    if (!chatSocket) {
        const token = localStorage.getItem('accessToken');
        chatSocket = io(`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000'}/chat`, {
            auth: { token },
            transports: ['websocket'],
        });
    }
    return chatSocket;
};

export const disconnectSockets = () => {
    if (documentSocket) {
        documentSocket.disconnect();
        documentSocket = null;
    }
    if (chatSocket) {
        chatSocket.disconnect();
        chatSocket = null;
    }
};
