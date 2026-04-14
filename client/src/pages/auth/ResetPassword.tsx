import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, School, CheckCircle } from 'lucide-react';
import { useResetPasswordMutation } from '../../store/api/endpoints';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

export default function ResetPassword() {
  const [showPass, setShowPass] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [reset, { isLoading, isSuccess }] = useResetPasswordMutation();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: any) => {
    try {
      await reset({ token, password: data.password }).unwrap();
      toast.success('Password reset successfully');
      setTimeout(() => navigate('/auth/login'), 2000);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-glow">
            <School size={20} className="text-white" />
          </div>
        </div>
        <div className="card p-8 animate-fade-up">
          {isSuccess ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-success" />
              </div>
              <h2 className="font-display font-bold text-xl text-text-primary">Password reset!</h2>
              <p className="text-text-secondary text-sm mt-2">Redirecting to login...</p>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-2xl text-text-primary">Set new password</h2>
              <p className="text-text-secondary text-sm mt-1 mb-6">Choose a strong password for your account.</p>
              {!token && <div className="badge badge-danger mb-4">Invalid or missing reset token</div>}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">New Password</label>
                  <div className="relative mt-1.5">
                    <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min 8 characters" className="input pr-11" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-danger text-xs mt-1">{(errors.password as any).message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Confirm Password</label>
                  <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className="input mt-1.5" />
                  {errors.confirmPassword && <p className="text-danger text-xs mt-1">{(errors.confirmPassword as any).message}</p>}
                </div>
                <button type="submit" disabled={isLoading || !token} className="btn-primary w-full justify-center">
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
