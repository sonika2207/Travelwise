import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const onSubmit = async (data) => {
    await login(data);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      
      const mockGoogleCreds = {
        name: 'Google Explorer',
        email: 'google.explorer@gmail.com',
        password: 'GooglePassword123',
        homeCity: 'San Francisco',
        homeCurrency: 'USD'
      };

      try {
        await authApi.register(mockGoogleCreds);
      } catch (err) {
        // User already exists
      }

      await login({
        email: mockGoogleCreds.email,
        password: mockGoogleCreds.password
      });
    } catch (error) {
      toast.error('Google login failed. Please try standard sign-in.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const submitForgotPassword = async () => {
    if (!forgotEmail.trim() || !/^\S+@\S+$/i.test(forgotEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    try {
      await authApi.forgotPassword(forgotEmail.trim().toLowerCase());
      toast.success(`✉️ Reset link sent to ${forgotEmail.trim().toLowerCase()}!`);
      setIsForgotModalOpen(false);
      setForgotEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to send reset link.');
    }
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
        <div className="font-serif text-[22px] font-bold text-text-heading">TravelWise</div>
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
          <button
            type="button"
            onClick={() => setIsForgotModalOpen(true)}
            className="text-[13px] text-sky no-underline font-medium hover:underline bg-transparent border-none cursor-pointer p-0"
          >
            Forgot password?
          </button>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || isGoogleLoading}
          className="btn btn-primary w-full justify-center p-[13px]"
        >
          {isSubmitting ? 'Signing in...' : '✈️ Sign In'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-[22px] text-text-light text-xs before:content-[''] before:flex-1 before:h-[1px] before:bg-border after:content-[''] after:flex-1 after:h-[1px] after:bg-border">
        or continue with
      </div>
      
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting || isGoogleLoading}
        className="btn btn-secondary w-full justify-center"
      >
        {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
      </button>

      <div className="text-center mt-6 text-sm text-text-muted">
        Don't have an account? <Link to="/register" className="text-sky font-semibold no-underline hover:underline">Create one &rarr;</Link>
      </div>

      {/* ── Forgot Password Modal ── */}
      {isForgotModalOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains('modal-backdrop')) {
              setIsForgotModalOpen(false);
            }
          }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            style={{
              background: 'var(--tw-bg-card)',
              borderRadius: '20px',
              padding: '32px 28px 28px',
              width: '360px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--tw-text-heading)', marginBottom: '8px', textAlign: 'center' }}>
              Reset password
            </div>
            <div style={{ fontSize: '13px', color: 'var(--tw-text-muted)', lineHeight: '1.5', marginBottom: '20px', textAlign: 'center' }}>
              Enter your email address and we'll send you a link to reset your password.
            </div>
            
            <label className="input-label" style={{ textAlign: 'left' }}>Email Address</label>
            <div className="input-wrap" style={{ marginBottom: '24px' }}>
              <span className="input-icon">✉️</span>
              <input
                type="email"
                className="input"
                placeholder="you@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px', height: '42px', justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitForgotPassword}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', height: '42px', justifyContent: 'center' }}
              >
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default Login;
