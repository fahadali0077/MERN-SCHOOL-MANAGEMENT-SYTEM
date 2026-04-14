import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  hasNew: boolean;
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, hasNew: false } as NotificationState,
  reducers: {
    setNotifications: (state, action: PayloadAction<{ notifications: Notification[]; unreadCount: number }>) => {
      state.items = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      state.unreadCount++;
      state.hasNew = true;
    },
    markRead: (state, action: PayloadAction<string>) => {
      const notif = state.items.find(n => n._id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: (state) => {
      state.items.forEach(n => n.isRead = true);
      state.unreadCount = 0;
    },
    clearNew: (state) => { state.hasNew = false; },
  }
});

export const { setNotifications, addNotification, markRead, markAllRead, clearNew } = notificationSlice.actions;
export default notificationSlice.reducer;
