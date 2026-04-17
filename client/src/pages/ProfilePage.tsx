import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Phone, Lock, Shield, Eye, EyeOff, Loader2, CheckCircle, Upload, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RootState } from '../store';
import { useChangePasswordMutation, useUpdateProfileMutation, useUploadAvatarMutation } from '../store/api/endpoints';
import { setUser } from '../store/slices/authSlice';

import { useWindowTitle } from '../hooks';

const roleLabels: Record<string, { label: string; color: string }> = {
  superAdmin: { label: 'Super Admin', color: '#EF4444' },
  schoolAdmin: { label: 'School Admin', color: '#0066FF' },
  teacher: { label: 'Teacher', color: '#10B981' },
  student: { label: 'Student', color: '#F59E0B' },
  parent: { label: 'Parent', color: '#8B5CF6' },
};

export default function ProfilePage() {
  useWindowTitle('My Profile');
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [showPass, setShowPass] = useState(false);
  const [passSection, setPassSection] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const profileForm = useForm<{ firstName: string; lastName: string }>({
    defaultValues: { firstName: user?.firstName || '', lastName: user?.lastName || '' },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData(); fd.append('avatar', file);
    try {
      const res = await uploadAvatar(fd).unwrap();
      if (res?.data?.user) dispatch(setUser(res.data.user));
      toast.success('Avatar updated');
    } catch (err: any) { toast.error(err?.data?.message || 'Upload failed'); }
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const onUpdateProfile = async (data: any) => {
    try {
      const res = await updateProfile(data).unwrap();
      if (res?.data?.user) dispatch(setUser(res.data.user));
      toast.success('Profile updated');
      setEditProfile(false);
    } catch (err: any) { toast.error(err?.data?.message || 'Update failed'); }
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();

  const onChangePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success('Password changed. Please log in again.');
      reset();
      setPassSection(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to change password');
    }
  };

  const roleInfo = user?.role ? roleLabels[user.role] : null;

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <p className="text-text-secondary">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-display font-bold text-text-primary">My Profile</h1>
        <p className="text-text-secondary text-sm">Manage your account information</p>
      </div>

      {/* Profile card */}
      <div className="card p-6 animate-fade-up animate-fade-up-delay-1">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white text-2xl font-display font-bold shadow-glow-sm relative group overflow-hidden"
              title="Click to change avatar"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                {isUploadingAvatar
                  ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <Upload size={16} className="text-white" />
                }
              </div>
            </button>
            {roleInfo && (
              <span
                className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ background: roleInfo.color }}
              >
                {roleInfo.label}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-display font-bold text-text-primary">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-text-secondary text-sm mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {user.isEmailVerified ? (
                <span className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle size={12} />Email verified
                </span>
              ) : (
                <span className="badge badge-warning text-xs">Email not verified</span>
              )}
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="mt-6 border border-white/5 rounded-xl overflow-hidden">
          {[
            { icon: User, label: 'Full Name', value: `${user.firstName} ${user.lastName}` },
            { icon: Mail, label: 'Email Address', value: user.email },
            { icon: Shield, label: 'Role', value: roleInfo?.label || user.role },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                <row.icon size={14} className="text-text-tertiary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-tertiary">{row.label}</p>
                <p className="text-sm text-text-primary font-medium mt-0.5">{row.value || '—'}</p>
              </div>
              <button className="text-xs text-accent hover:underline">Edit</button>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile */}
      {editProfile ? (
        <div className="card p-6 animate-fade-up">
          <h3 className="font-display font-semibold text-text-primary mb-4">Edit Profile</h3>
          <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">First Name</label>
                <input {...profileForm.register('firstName', { required: true })} className="input mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Name</label>
                <input {...profileForm.register('lastName', { required: true })} className="input mt-1.5" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Phone</label>
              <input {...profileForm.register('phone')} placeholder="+1 234 567 890" className="input mt-1.5" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditProfile(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={isUpdatingProfile} className="btn-primary flex-1 justify-center">
                {isUpdatingProfile && <Loader2 size={14} className="animate-spin" />}
                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex justify-end">
          <button onClick={() => { setEditProfile(true); profileForm.reset({ firstName: user.firstName, lastName: user.lastName }); }} className="btn-secondary text-sm flex items-center gap-2">
            <Edit2 size={14} /> Edit Profile
          </button>
        </div>
      )}

      {/* Change password */}
      <div className="card p-6 animate-fade-up animate-fade-up-delay-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center">
              <Lock size={16} className="text-warning" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-text-primary text-sm">Password & Security</h3>
              <p className="text-xs text-text-tertiary">Change your login password</p>
            </div>
          </div>
          <button
            onClick={() => setPassSection(!passSection)}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            {passSection ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {passSection && (
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 pt-4 border-t border-white/5">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Current Password
              </label>
              <div className="relative mt-1.5">
                <input
                  {...register('currentPassword', { required: true })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Current password"
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                New Password
              </label>
              <input
                {...register('newPassword', { required: true, minLength: 8 })}
                type="password"
                placeholder="Min 8 characters"
                className="input mt-1.5"
              />
              {errors.newPassword && (
                <p className="text-danger text-xs mt-1">Minimum 8 characters</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                {...register('confirmPassword', { required: true })}
                type="password"
                placeholder="Repeat new password"
                className="input mt-1.5"
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary text-sm w-full justify-center">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
