import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BASE_URL } from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(BASE_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            console.log('⚡ Socket connected:', newSocket.id);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
