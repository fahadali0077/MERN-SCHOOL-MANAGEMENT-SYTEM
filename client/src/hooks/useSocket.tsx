import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import { RootState } from '../store';
import toast from 'react-hot-toast';

let socketInstance: Socket | null = null;

// FIX: In production, Socket.io must connect to the Render backend URL directly
// (not window.location.origin which would be the Vercel frontend URL).
// In development, window.location.origin works fine via Vite proxy.
const getSocketURL = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL as string;
  }
  return window.location.origin;
};

export const useSocket = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !accessToken) return;

    if (!socketInstance) {
      socketInstance = io(getSocketURL(), {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        // In production, Socket.io path stays the same (/socket.io)
        withCredentials: true,
      });
    }

    socketRef.current = socketInstance;

    const onConnect = () => {
      // Join the user's personal room for targeted notifications
      socketInstance?.emit('user:join', { userId: user._id });
    };

    const onNotification = (notification: any) => {
      dispatch(addNotification(notification));
      toast(notification.title + (notification.message ? ': ' + notification.message : ''), {
        duration: 4000,
        icon: '🔔',
      });
    };

    const onDisconnect = () => {
      console.log('[Socket] Disconnected');
    };

    const onError = (err: Error) => {
      console.warn('[Socket] Error:', err.message);
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('notification:new', onNotification);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('connect_error', onError);

    return () => {
      socketInstance?.off('connect', onConnect);
      socketInstance?.off('notification:new', onNotification);
      socketInstance?.off('disconnect', onDisconnect);
      socketInstance?.off('connect_error', onError);
    };
  }, [user, accessToken, dispatch]);

  const emit = (event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  };

  const joinClass = (classId: string) => {
    socketRef.current?.emit('join:class', classId);
  };

  const leaveClass = (classId: string) => {
    socketRef.current?.emit('leave:class', classId);
  };

  return { socket: socketRef.current, emit, joinClass, leaveClass };
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
