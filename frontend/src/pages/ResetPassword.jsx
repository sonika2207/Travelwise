import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthLayout from '../layouts/AuthLayout';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Reset token is missing from the URL.');
      return;
    }

    try {
      setIsSubmitting(true);
      await authApi.resetPassword(token, data.password);
      toast.success('🔑 Password reset successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
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
      leftTitle={"Reset your\npassword"}
      leftSubtitle="Enter your new credentials to secure your account and resume planning."
      destinations={destinations}
      showStats={true}
    >
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky to-teal flex items-center justify-center text-xl shadow-[0_2px_8px_rgba(74,144,217,0.3)]">✈️</div>
        <div className="font-serif text-[22px] font-bold text-text-heading">TravelWise</div>
      </div>
      
      <div className="font-serif text-[30px] font-bold text-text-heading leading-[1.2] mb-1.5">Secure your account 🔒</div>
      <div className="text-sm text-text-muted mb-8">Please enter your new password below.</div>

      {!token ? (
        <div className="p-4 bg-coral-light border border-coral text-coral rounded-xl text-sm leading-relaxed mb-6">
          <strong>Error:</strong> The reset token is missing. Please make sure you clicked the complete link sent to your email.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="input-label">New Password</label>
          <div className="input-wrap">
            <span className="input-icon">🔒</span>
            <input 
              className={`input ${errors.password ? 'border-coral' : ''}`}
              type="password"
              placeholder="At least 6 characters" 
              {...register('password', { 
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })} 
            />
          </div>
          {errors.password && <p className="text-coral text-xs mt-[-14px] mb-[18px]">{errors.password.message}</p>}

          <label className="input-label">Confirm Password</label>
          <div className="input-wrap">
            <span className="input-icon">🔒</span>
            <input 
              className={`input ${errors.confirmPassword ? 'border-coral' : ''}`}
              type="password"
              placeholder="Verify your new password" 
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })} 
            />
          </div>
          {errors.confirmPassword && <p className="text-coral text-xs mt-[-14px] mb-[18px]">{errors.confirmPassword.message}</p>}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-primary w-full justify-center p-[13px]"
          >
            {isSubmitting ? 'Updating...' : '🔒 Reset Password'}
          </button>
        </form>
      )}

      <div className="text-center mt-6 text-sm text-text-muted">
        Remembered your password? <Link to="/login" className="text-sky font-semibold no-underline hover:underline">Sign In</Link>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
