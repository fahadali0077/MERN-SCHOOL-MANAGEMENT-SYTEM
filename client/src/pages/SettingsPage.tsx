import React, { useState } from 'react';
import { Settings, Bell, Moon, Globe, Shield, Trash2, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-all ${enabled ? 'bg-accent' : 'bg-white/10'}`}>
    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${enabled ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`}/>
  </button>
);

export default function SettingsPage() {
  const [notifs, setNotifs] = useState({ email: true, sms: false, push: true, attendance: true, fees: true, results: true });
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof notifs) => setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    toast.success('Settings saved');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-display font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary text-sm">Manage your preferences and account settings</p>
      </div>

      {/* Notifications */}
      <div className="card p-6 space-y-5 animate-fade-up animate-fade-up-delay-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Bell size={16} className="text-accent"/>
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
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-tertiary">{item.desc}</p>
              </div>
              <Toggle enabled={notifs[item.key as keyof typeof notifs]} onToggle={() => toggle(item.key as keyof typeof notifs)}/>
            </div>
          ))}
        </div>
      </div>

      {/* Notification types */}
      <div className="card p-6 space-y-5 animate-fade-up animate-fade-up-delay-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
            <Bell size={16} className="text-success"/>
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
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-tertiary">{item.desc}</p>
              </div>
              <Toggle enabled={notifs[item.key as keyof typeof notifs]} onToggle={() => toggle(item.key as keyof typeof notifs)}/>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-6 space-y-4 animate-fade-up animate-fade-up-delay-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Moon size={16} className="text-purple-400"/>
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
          ].map(theme => (
            <button key={theme.label} disabled={!theme.active}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme.active ? 'border-accent bg-accent/5' : 'border-white/5 opacity-40 cursor-not-allowed'
              }`}>
              <div className="w-6 h-6 rounded-full border-2 border-accent flex items-center justify-center mb-2">
                {theme.active && <div className="w-3 h-3 rounded-full bg-accent"/>}
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
            <Trash2 size={16} className="text-danger"/>
          </div>
          <div>
            <h3 className="font-display font-semibold text-danger">Danger Zone</h3>
            <p className="text-xs text-text-tertiary">Irreversible actions</p>
          </div>
        </div>
        <button className="w-full py-2.5 rounded-xl border border-danger/30 text-danger text-sm font-medium hover:bg-danger/5 transition-all">
          Delete My Account
        </button>
      </div>

      {/* Save button */}
      <div className="flex justify-end animate-fade-up">
        <button onClick={handleSave} className={`btn-primary text-sm transition-all ${saved ? 'bg-success hover:bg-success' : ''}`}>
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
