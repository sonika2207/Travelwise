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
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [googleStep, setGoogleStep] = useState('list'); // 'list' | 'input'
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const onSubmit = async (data) => {
    await login(data);
  };

  const handleGoogleLogin = () => {
    setIsGoogleChooserOpen(true);
    setGoogleStep('list');
    setCustomGoogleEmail('');
    setCustomGoogleName('');
  };

  const handleSelectGoogleAccount = async (email, name) => {
    if (!email.trim() || !/^\S+@\S+$/i.test(email)) {
      toast.error('Please enter a valid Google email address.');
      return;
    }
    const finalName = name.trim() || email.split('@')[0];

    try {
      setIsGoogleLoading(true);
      setIsGoogleChooserOpen(false);

      const mockGoogleCreds = {
        name: finalName,
        email: email.trim().toLowerCase(),
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

      {/* ── Google Account Chooser Modal ── */}
      {isGoogleChooserOpen && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed', inset: 0, zIndex: 110,
            background: '#F0F4F9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Roboto, Arial, sans-serif'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '28px',
              padding: '40px',
              width: '450px',
              minHeight: '500px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              display: 'flex', flexDirection: 'column',
              boxSizing: 'border-box'
            }}
          >
            {/* Google Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>

            {googleStep === 'list' ? (
              <>
                <div style={{ fontSize: '24px', color: '#1f1f1f', textAlign: 'center', marginBottom: '8px', fontWeight: 400 }}>
                  Choose an account
                </div>
                <div style={{ fontSize: '16px', color: '#444746', textAlign: 'center', marginBottom: '24px' }}>
                  to continue to <span style={{ fontWeight: 500, color: '#1a73e8' }}>TravelWise</span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {/* Account 1: Google Explorer */}
                  <div
                    onClick={() => handleSelectGoogleAccount('google.explorer@gmail.com', 'Google Explorer')}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '12px',
                      cursor: 'pointer', border: '1px solid transparent', transition: 'background-color 0.2s',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F4F9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1a73e8',
                      color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 500, fontSize: '15px', marginRight: '12px'
                    }}>
                      GE
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#1f1f1f' }}>Google Explorer</div>
                      <div style={{ fontSize: '12px', color: '#444746' }}>google.explorer@gmail.com</div>
                    </div>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#e3e3e3', margin: '8px 0' }} />

                  {/* Option 2: Use another account */}
                  <div
                    onClick={() => setGoogleStep('input')}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '12px',
                      cursor: 'pointer', transition: 'background-color 0.2s',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F4F9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e3e3e3',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      👤
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1f1f1f' }}>
                      Use another account
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '24px', color: '#1f1f1f', textAlign: 'center', marginBottom: '8px', fontWeight: 400 }}>
                  Sign in with Google
                </div>
                <div style={{ fontSize: '16px', color: '#444746', textAlign: 'center', marginBottom: '32px' }}>
                  to continue to <span style={{ fontWeight: 500, color: '#1a73e8' }}>TravelWise</span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <input
                      type="text"
                      placeholder="Name"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      style={{
                        width: '100%', padding: '16px', borderRadius: '4px',
                        border: '1px solid #747775', fontSize: '16px', outline: 'none',
                        boxSizing: 'border-box', background: '#FFFFFF', color: '#000000'
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      style={{
                        width: '100%', padding: '16px', borderRadius: '4px',
                        border: '1px solid #747775', fontSize: '16px', outline: 'none',
                        boxSizing: 'border-box', background: '#FFFFFF', color: '#000000'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleStep('list');
                      setCustomGoogleEmail('');
                      setCustomGoogleName('');
                    }}
                    style={{
                      background: 'none', border: 'none', color: '#1a73e8', fontSize: '14px',
                      fontWeight: 500, cursor: 'pointer', padding: '0 8px'
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectGoogleAccount(customGoogleEmail, customGoogleName)}
                    style={{
                      backgroundColor: '#1a73e8', border: 'none', color: '#ffffff', fontSize: '14px',
                      fontWeight: 500, cursor: 'pointer', padding: '10px 24px', borderRadius: '100px'
                    }}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#747775', marginTop: '40px' }}>
              <button
                type="button"
                onClick={() => setIsGoogleChooserOpen(false)}
                style={{ background: 'none', border: 'none', color: '#747775', fontSize: '12px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <div>English (United States)</div>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default Login;
