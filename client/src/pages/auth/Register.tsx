import { useWindowTitle } from '../../hooks';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, School, ArrowRight, Loader2 } from 'lucide-react';
import { useRegisterMutation } from '../../store/api/endpoints';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const schema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['schoolAdmin', 'teacher', 'student', 'parent']),
  phone: z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  useWindowTitle('Create Account');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const { register: reg, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'schoolAdmin' }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { confirmPassword, ...payload } = data;
      const res = await register(payload).unwrap();
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-glow">
            <School size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl">
            <span className="text-text-primary">School</span><span className="text-accent">MS</span>
          </span>
        </div>

        <div className="card p-8 animate-fade-up">
          <h2 className="font-display font-bold text-2xl text-text-primary text-center">Create your account</h2>
          <p className="text-text-secondary text-sm text-center mt-1 mb-8">Start managing your school today</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">First Name</label>
                <input {...reg('firstName')} placeholder="John" className="input mt-1.5" />
                {errors.firstName && <p className="text-danger text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Name</label>
                <input {...reg('lastName')} placeholder="Doe" className="input mt-1.5" />
                {errors.lastName && <p className="text-danger text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email</label>
              <input {...reg('email')} type="email" placeholder="you@school.edu" className="input mt-1.5" />
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Role</label>
              <select {...reg('role')} className="input mt-1.5">
                <option value="schoolAdmin">School Administrator</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Password</label>
              <div className="relative mt-1.5">
                <input {...reg('password')} type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" className="input pr-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Confirm Password</label>
              <input {...reg('confirmPassword')} type="password" placeholder="Repeat password" className="input mt-1.5" />
              {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center mt-2">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-accent hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
