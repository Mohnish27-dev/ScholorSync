'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS, type SendMessagePayload, type TypingPayload } from '@/lib/socket/socketEvents';
import type { RoomMessage, UserRole } from '@/types/fellowships';

interface UseSocketOptions {
    roomId: string;
    userId: string;
    userName: string;
    userRole: UserRole;
    onNewMessage?: (message: RoomMessage) => void;
    onUserTyping?: (data: { userId: string; userName: string; isTyping: boolean }) => void;
    onUserJoined?: (data: { userId: string; userName: string; userRole: UserRole }) => void;
    onUserLeft?: (data: { userId: string; userName: string; userRole: UserRole }) => void;
    onRoomUsers?: (users: Array<{ id: string; name: string; role: UserRole }>) => void;
}

interface UseSocketReturn {
    isConnected: boolean;
    sendMessage: (content: string, type?: 'text' | 'file' | 'milestone', attachmentUrl?: string, attachmentName?: string) => void;
    sendFileMessage: (attachmentUrl: string, attachmentName: string) => void;
    startTyping: () => void;
    stopTyping: () => void;
    onlineUsers: Array<{ id: string; name: string; role: UserRole }>;
}

export function useSocket({
    roomId,
    userId,
    userName,
    userRole,
    onNewMessage,
    onUserTyping,
    onUserJoined,
    onUserLeft,
    onRoomUsers,
}: UseSocketOptions): UseSocketReturn {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Array<{ id: string; name: string; role: UserRole }>>([]);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize socket connection
    useEffect(() => {
        if (!roomId || !userId) return;

        // Create socket connection
        const socket = io({
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        // Connection handlers
        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
            setIsConnected(true);

            // Join the room
            socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
                roomId,
                userId,
                userName,
                userRole,
            });
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error);
            setIsConnected(false);
        });

        // Message handlers
        socket.on(SOCKET_EVENTS.NEW_MESSAGE, (message: RoomMessage) => {
            console.log('[Socket] New message:', message);
            onNewMessage?.(message);
        });

        // Typing handlers
        socket.on(SOCKET_EVENTS.USER_TYPING, (data) => {
            onUserTyping?.(data);
        });

        // User presence handlers
        socket.on(SOCKET_EVENTS.USER_JOINED, (data) => {
            setOnlineUsers((prev) => {
                if (prev.some((u) => u.id === data.userId)) return prev;
                return [...prev, { id: data.userId, name: data.userName, role: data.userRole }];
            });
            onUserJoined?.(data);
        });

        socket.on(SOCKET_EVENTS.USER_LEFT, (data) => {
            setOnlineUsers((prev) => prev.filter((u) => u.id !== data.userId));
            onUserLeft?.(data);
        });

        socket.on(SOCKET_EVENTS.ROOM_USERS, (data) => {
            setOnlineUsers(data.users);
            onRoomUsers?.(data.users);
        });

        // Cleanup on unmount
        return () => {
            if (socket.connected) {
                socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId });
            }
            socket.disconnect();
            socketRef.current = null;
        };
    }, [roomId, userId, userName, userRole]);

    // Send text message
    const sendMessage = useCallback(
        (content: string, type: 'text' | 'file' | 'milestone' = 'text', attachmentUrl?: string, attachmentName?: string) => {
            if (!socketRef.current?.connected || !content.trim()) return;

            const payload: SendMessagePayload = {
                roomId,
                senderId: userId,
                senderName: userName,
                senderRole: userRole,
                content,
                type,
                attachmentUrl,
                attachmentName,
            };

            socketRef.current.emit(SOCKET_EVENTS.SEND_MESSAGE, payload);

            // Stop typing indicator when message is sent
            stopTyping();
        },
        [roomId, userId, userName, userRole]
    );

    // Send file message
    const sendFileMessage = useCallback(
        (attachmentUrl: string, attachmentName: string) => {
            if (!socketRef.current?.connected) return;

            const payload: SendMessagePayload = {
                roomId,
                senderId: userId,
                senderName: userName,
                senderRole: userRole,
                content: '',
                type: 'file',
                attachmentUrl,
                attachmentName,
            };

            socketRef.current.emit(SOCKET_EVENTS.SEND_MESSAGE, payload);
        },
        [roomId, userId, userName, userRole]
    );

    // Typing indicators
    const startTyping = useCallback(() => {
        if (!socketRef.current?.connected) return;

        socketRef.current.emit(SOCKET_EVENTS.TYPING_START, {
            roomId,
            userId,
            userName,
        } as TypingPayload);

        // Auto-stop typing after 3 seconds of no input
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 3000);
    }, [roomId, userId, userName]);

    const stopTyping = useCallback(() => {
        if (!socketRef.current?.connected) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        socketRef.current.emit(SOCKET_EVENTS.TYPING_STOP, {
            roomId,
            userId,
            userName,
        } as TypingPayload);
    }, [roomId, userId, userName]);

    return {
        isConnected,
        sendMessage,
        sendFileMessage,
        startTyping,
        stopTyping,
        onlineUsers,
    };
}
