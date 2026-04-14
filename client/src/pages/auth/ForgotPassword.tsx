// ForgotPassword.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, Loader2, School } from 'lucide-react';
import { useForgotPasswordMutation } from '../../store/api/endpoints';
import toast from 'react-hot-toast';

const schema = z.object({ email: z.string().email('Enter a valid email') });

export default function ForgotPassword() {
  const [forgot, { isLoading, isSuccess }] = useForgotPasswordMutation();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: any) => {
    try {
      await forgot(data).unwrap();
      toast.success('Reset link sent — check your inbox');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Request failed');
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
                <Mail size={28} className="text-success" />
              </div>
              <h2 className="font-display font-bold text-xl text-text-primary">Check your email</h2>
              <p className="text-text-secondary text-sm mt-2">We sent a password reset link to your email address.</p>
              <Link to="/auth/login" className="btn-primary inline-flex mt-6">Back to Login</Link>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-2xl text-text-primary">Forgot password?</h2>
              <p className="text-text-secondary text-sm mt-1 mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email</label>
                  <input {...register('email')} type="email" placeholder="you@school.edu" className="input mt-1.5" />
                  {errors.email && <p className="text-danger text-xs mt-1">{(errors.email as any).message}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center">
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/auth/login" className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mt-4 justify-center">
                <ArrowLeft size={14} /> Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
