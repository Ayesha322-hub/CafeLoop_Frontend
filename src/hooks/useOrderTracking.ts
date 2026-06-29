import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../api/client';

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export const useOrderTracking = (orderId: string) => {
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // Connect to /orders namespace
    const newSocket = io(`${BASE_URL.replace('/api/v1', '')}/orders`, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to order tracking socket');
      newSocket.emit('subscribe_order', orderId);
    });

    newSocket.on('status_update', (data: { orderId: string; status: OrderStatus }) => {
      if (data.orderId === orderId) {
        setStatus(data.status);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [orderId]);

  return { status, socket };
};