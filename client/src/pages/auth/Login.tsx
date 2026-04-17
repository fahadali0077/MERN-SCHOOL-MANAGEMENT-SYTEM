import { useWindowTitle } from '../../hooks';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, School, ArrowRight, Loader2 } from 'lucide-react';
import { useLoginMutation } from '../../store/api/endpoints';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  useWindowTitle('Sign In');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await login(data).unwrap();
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      toast.success(`Welcome back, ${res.data.user.firstName}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-bg-secondary border-r border-white/5">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent/20 rounded-full blur-[80px] animate-pulse-glow" />
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-purple-500/15 rounded-full blur-[60px]" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-glow">
              <School size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl">
              <span className="text-text-primary">School</span>
              <span className="text-accent">MS</span>
            </span>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="animate-fade-up">
              <h1 className="font-display font-bold text-4xl text-text-primary leading-tight mb-4">
                The smarter way to manage your school
              </h1>
              <p className="text-text-secondary leading-relaxed">
                Manage students, track attendance, generate report cards, and communicate with parents — all in one place.
              </p>
            </div>

            {/* Feature list */}
            <div className="mt-10 space-y-4 animate-fade-up animate-fade-up-delay-1">
              {[
                { label: 'Real-time attendance with QR codes', color: '#10B981' },
                { label: 'Automated fee management & invoicing', color: '#0066FF' },
                { label: 'Instant parent notifications', color: '#F59E0B' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: f.color }} />
                  <span className="text-sm text-text-secondary">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex gap-8 animate-fade-up animate-fade-up-delay-2">
            {[
              { value: '500+', label: 'Schools' },
              { value: '2M+', label: 'Students' },
              { value: '99.9%', label: 'Uptime' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-display font-bold text-text-primary">{s.value}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 lg:max-w-lg flex flex-col justify-center px-8 md:px-12 lg:px-16">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <School size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg">
            <span className="text-text-primary">School</span><span className="text-accent">MS</span>
          </span>
        </div>

        <div className="animate-fade-up">
          <h2 className="font-display font-bold text-3xl text-text-primary">Welcome back</h2>
          <p className="text-text-secondary mt-2 text-sm">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5 animate-fade-up animate-fade-up-delay-1">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@school.edu"
              className="input"
              autoComplete="email"
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Password</label>
              <Link to="/auth/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="input pr-11"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center mt-2">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 rounded-xl bg-bg-tertiary border border-white/5 animate-fade-up animate-fade-up-delay-2">
          <p className="text-xs font-semibold text-text-secondary mb-2">Demo credentials</p>
          <div className="space-y-1">
            {[
              { role: 'Admin', email: 'admin@demo.com', pass: 'demo1234' },
              { role: 'Teacher', email: 'teacher@demo.com', pass: 'demo1234' },
              { role: 'Student', email: 'student@demo.com', pass: 'demo1234' },
            ].map((d) => (
              <div key={d.role} className="flex items-center gap-2 text-xs">
                <span className="badge badge-accent py-0.5">{d.role}</span>
                <span className="text-text-tertiary font-mono">{d.email}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary animate-fade-up animate-fade-up-delay-3">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-accent hover:underline font-medium">Get started free</Link>
        </p>
      </div>
    </div>
  );
}
