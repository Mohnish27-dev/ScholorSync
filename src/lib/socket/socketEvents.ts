// Socket.IO Event Types and Payloads

import type { RoomMessage, UserRole } from '@/types/fellowships';

// Event names
export const SOCKET_EVENTS = {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    
    // Room management
    JOIN_ROOM: 'join-room',
    LEAVE_ROOM: 'leave-room',
    
    // Messaging
    SEND_MESSAGE: 'send-message',
    NEW_MESSAGE: 'new-message',
    
    // Typing indicator
    TYPING_START: 'typing-start',
    TYPING_STOP: 'typing-stop',
    USER_TYPING: 'user-typing',
    
    // File uploads
    FILE_UPLOADED: 'file-uploaded',
    
    // User presence
    USER_JOINED: 'user-joined',
    USER_LEFT: 'user-left',
    ROOM_USERS: 'room-users',
} as const;

// Payload types
export interface JoinRoomPayload {
    roomId: string;
    userId: string;
    userName: string;
    userRole: UserRole;
}

export interface SendMessagePayload {
    roomId: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    content: string;
    type: 'text' | 'file' | 'milestone';
    attachmentUrl?: string;
    attachmentName?: string;
}

export interface TypingPayload {
    roomId: string;
    userId: string;
    userName: string;
}

export interface FileUploadedPayload {
    roomId: string;
    message: RoomMessage;
}

export interface RoomUserPayload {
    roomId: string;
    userId: string;
    userName: string;
    userRole: UserRole;
}

export interface RoomUsersPayload {
    roomId: string;
    users: Array<{
        id: string;
        name: string;
        role: UserRole;
    }>;
}
