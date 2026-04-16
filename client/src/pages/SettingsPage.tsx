import React, { useState, useEffect } from 'react';
import { Bell, Moon, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setUser } from '../store/slices/authSlice';
import { apiSlice } from '../store/api/apiSlice';

// FIX: Inject endpoint inline — settings are saved to PATCH /auth/preferences
// which updates the user's preferences field in MongoDB.
const settingsApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    updatePreferences: b.mutation<any, { notifications: any }>({
      query: (data) => ({ url: '/auth/preferences', method: 'PATCH', body: data }),
      invalidatesTags: ['User'],
    }),
    deleteAccount: b.mutation<any, { password: string }>({
      query: (data) => ({ url: '/auth/account', method: 'DELETE', body: data }),
    }),
  }),
  overrideExisting: false,
});

const { useUpdatePreferencesMutation, useDeleteAccountMutation } = settingsApi;

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={enabled}
    className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-accent' : 'bg-white/10'}`}
  >
    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
  </button>
);

const DEFAULT_NOTIFS = {
  email: true, sms: false, push: true,
  attendance: true, fees: true, results: true,
};

export default function SettingsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const [notifs, setNotifs] = useState(DEFAULT_NOTIFS);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // FIX: Pre-populate from persisted user preferences on mount
  useEffect(() => {
    if (user?.preferences) {
      const saved = (user.preferences as any).notifications;
      if (saved) setNotifs((prev) => ({ ...prev, ...saved }));
    }
  }, [user]);

  const [updatePreferences, { isLoading: isSaving }] = useUpdatePreferencesMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const toggle = (key: keyof typeof notifs) =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  // FIX: handleSave now calls the real backend endpoint
  const handleSave = async () => {
    try {
      const res = await updatePreferences({ notifications: notifs }).unwrap();
      if (res?.data?.user) dispatch(setUser(res.data.user));
      toast.success('Settings saved');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save settings');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return toast.error('Enter your password to confirm');
    try {
      await deleteAccount({ password: deletePassword }).unwrap();
      toast.success('Account deleted');
      // The auth middleware will catch the next request and clear the session
      window.location.href = '/auth/login';
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-display font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary text-sm">Manage your preferences and account settings</p>
      </div>

      {/* Notification channels */}
      <div className="card p-6 space-y-5 animate-fade-up animate-fade-up-delay-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Bell size={16} className="text-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-text-primary">Notification Channels</h3>
            <p className="text-xs text-text-tertiary">Choose how you receive notifications</p>
          </div>
        </div>
        <div className="space-y-3 border-t border-white/5 pt-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive alerts via email' },
            { key: 'sms', label: 'SMS Alerts', desc: 'Get text messages for urgent updates' },
            { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-tertiary">{item.desc}</p>
              </div>
              <Toggle
                enabled={notifs[item.key as keyof typeof notifs]}
                onToggle={() => toggle(item.key as keyof typeof notifs)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notification types */}
      <div className="card p-6 space-y-5 animate-fade-up animate-fade-up-delay-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
            <Bell size={16} className="text-success" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-text-primary">Notification Types</h3>
            <p className="text-xs text-text-tertiary">Choose what you're notified about</p>
          </div>
        </div>
        <div className="space-y-3 border-t border-white/5 pt-4">
          {[
            { key: 'attendance', label: 'Attendance Alerts', desc: 'When attendance is marked' },
            { key: 'fees', label: 'Fee Reminders', desc: 'Due dates and payment confirmations' },
            { key: 'results', label: 'Result Publications', desc: 'When exam results are published' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-tertiary">{item.desc}</p>
              </div>
              <Toggle
                enabled={notifs[item.key as keyof typeof notifs]}
                onToggle={() => toggle(item.key as keyof typeof notifs)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-6 space-y-4 animate-fade-up animate-fade-up-delay-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Moon size={16} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-text-primary">Appearance</h3>
            <p className="text-xs text-text-tertiary">Customize your interface</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
          {[
            { label: 'Dark Mode', sub: 'Current theme', active: true },
            { label: 'Light Mode', sub: 'Coming soon', active: false },
          ].map((theme) => (
            <button
              key={theme.label}
              disabled={!theme.active}
              type="button"
              className={`p-4 rounded-xl border text-left transition-all ${
                theme.active
                  ? 'border-accent bg-accent/5'
                  : 'border-white/5 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="w-6 h-6 rounded-full border-2 border-accent flex items-center justify-center mb-2">
                {theme.active && <div className="w-3 h-3 rounded-full bg-accent" />}
              </div>
              <p className="text-sm font-medium text-text-primary">{theme.label}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{theme.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-danger/20 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center">
            <Trash2 size={16} className="text-danger" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-danger">Danger Zone</h3>
            <p className="text-xs text-text-tertiary">Irreversible actions</p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2.5 rounded-xl border border-danger/30 text-danger text-sm font-medium hover:bg-danger/5 transition-all"
          >
            Delete My Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Enter your password to permanently delete your account. This cannot be undone.
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your current password"
              className="input w-full"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                {isDeleting ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex justify-end animate-fade-up">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60"
        >
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          {isSaving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
