import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (user) {
            const newSocket = io(backendUrl, {
                withCredentials: true,
                autoConnect: true
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                newSocket.emit('join-farmer-room', user.id || user._id);
            });

            newSocket.on('new-notification', (notification) => {
                console.log('Received new notification:', notification);
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [user, backendUrl]);

    const resetUnreadCount = () => setUnreadCount(0);
    
    const joinRegion = (region) => {
        if (socket && region) {
            socket.emit('join-region', region);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, resetUnreadCount, joinRegion }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
