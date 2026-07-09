import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    await login(data);
  };

  const destinations = [
    { name: 'Paris', icon: '📬' },
    { name: 'Bali', icon: '🏝️' },
    { name: 'Nepal', icon: '🏔️' },
    { name: 'Tokyo', icon: '🌸' }
  ];

  return (
    <AuthLayout
      leftTitle={"Your journey\nbegins here"}
      leftSubtitle="Plan, pack, and explore — all in one place"
      destinations={destinations}
      showStats={true}
    >
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky to-teal flex items-center justify-center text-xl shadow-[0_2px_8px_rgba(74,144,217,0.3)]">✈️</div>
        <div className="font-serif text-[22px] font-bold text-text-heading">Wanderly</div>
      </div>
      
      <div className="font-serif text-[30px] font-bold text-text-heading leading-[1.2] mb-1.5">Welcome back, traveler 👋</div>
      <div className="text-sm text-text-muted mb-8">Sign in to continue planning your next adventure.</div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="input-label">Email</label>
        <div className="input-wrap">
          <span className="input-icon">✉️</span>
          <input 
            className={`input ${errors.email ? 'border-coral' : ''}`}
            placeholder="you@email.com" 
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
            })} 
          />
        </div>
        {errors.email && <p className="text-coral text-xs mt-[-14px] mb-[18px]">{errors.email.message}</p>}

        <label className="input-label">Password</label>
        <div className="input-wrap">
          <span className="input-icon">🔒</span>
          <input 
            className={`input ${errors.password ? 'border-coral' : ''}`}
            type="password" 
            placeholder="Enter your password"
            {...register('password', { required: 'Password is required' })} 
          />
        </div>
        {errors.password && <p className="text-coral text-xs mt-[-14px] mb-[18px]">{errors.password.message}</p>}

        <div className="flex items-center justify-between mb-5">
          <label className="flex items-center gap-[7px] text-[13px] text-text-muted cursor-pointer">
            <input type="checkbox" className="rounded border-border text-sky focus:ring-sky" /> Remember me
          </label>
          <a href="#" className="text-[13px] text-sky no-underline font-medium hover:underline">Forgot password?</a>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn btn-primary w-full justify-center p-[13px]"
        >
          {isSubmitting ? 'Signing in...' : '✈️ Sign In'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-[22px] text-text-light text-xs before:content-[''] before:flex-1 before:h-[1px] before:bg-border after:content-[''] after:flex-1 after:h-[1px] after:bg-border">
        or continue with
      </div>
      
      <button type="button" className="btn btn-secondary w-full justify-center">
        Continue with Google
      </button>

      <div className="text-center mt-6 text-sm text-text-muted">
        Don't have an account? <Link to="/register" className="text-sky font-semibold no-underline hover:underline">Create one &rarr;</Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
