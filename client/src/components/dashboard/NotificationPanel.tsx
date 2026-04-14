import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '../../store/api/endpoints';
import { setNotifications, markRead, markAllRead } from '../../store/slices/notificationSlice';
import { RootState } from '../../store';
import { formatDistanceToNow } from 'date-fns';

const typeIcons: Record<string, string> = {
  info: '💬', success: '✅', warning: '⚠️', danger: '🚨',
  fee: '💰', attendance: '📋', marks: '📊', notice: '📢',
  assignment: '📝', message: '✉️'
};

interface Props { onClose: () => void; }

export default function NotificationPanel({ onClose }: Props) {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notifications.items);
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

  const { data } = useGetNotificationsQuery({ page: 1 });
  const [markNotifRead] = useMarkNotificationReadMutation();
  const [markAllRead_] = useMarkAllNotificationsReadMutation();

  useEffect(() => {
    if (data?.data) {
      dispatch(setNotifications({ notifications: data.data.notifications, unreadCount: data.data.unreadCount }));
    }
  }, [data, dispatch]);

  const handleMarkRead = async (id: string) => {
    dispatch(markRead(id));
    await markNotifRead(id).unwrap().catch(() => {});
  };

  const handleMarkAllRead = async () => {
    dispatch(markAllRead());
    await markAllRead_().unwrap().catch(() => {});
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-16 right-4 z-50 w-80 max-h-[calc(100vh-5rem)] flex flex-col card animate-slide-in shadow-card-hover">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-accent" />
            <span className="font-display font-semibold text-text-primary text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="badge badge-accent text-[10px] py-0">{unreadCount}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-success hover:bg-success/10 transition-all"
                title="Mark all read">
                <CheckCheck size={14} />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-white/5">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-text-tertiary">
              <Bell size={28} className="opacity-20 mb-2" />
              <p className="text-xs">All caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notif) => (
                <div key={notif._id}
                  onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                  className={`p-3 flex gap-3 cursor-pointer hover:bg-white/2 transition-all ${!notif.isRead ? 'bg-accent/5' : ''}`}>
                  <div className="text-lg flex-shrink-0 leading-none mt-0.5">
                    {typeIcons[notif.type] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-semibold leading-snug ${notif.isRead ? 'text-text-secondary' : 'text-text-primary'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-text-tertiary mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-text-tertiary mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {notif.link && (
                    <a href={notif.link} onClick={e => e.stopPropagation()}
                      className="flex-shrink-0 p-1 rounded text-text-tertiary hover:text-accent transition-colors">
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
