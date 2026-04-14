import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import { RootState } from '../store';
import toast from 'react-hot-toast';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !accessToken) return;

    if (!socketInstance) {
      socketInstance = io(window.location.origin, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = socketInstance;

    const onConnect = () => {
      console.log('Socket connected');
    };

    const onNotification = (notification: any) => {
      dispatch(addNotification(notification));
      toast(notification.title + ': ' + notification.message, {
        duration: 4000,
        icon: '🔔',
      });
    };

    const onDisconnect = () => {
      console.log('Socket disconnected');
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('notification:new', onNotification);
    socketInstance.on('disconnect', onDisconnect);

    return () => {
      socketInstance?.off('connect', onConnect);
      socketInstance?.off('notification:new', onNotification);
      socketInstance?.off('disconnect', onDisconnect);
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
