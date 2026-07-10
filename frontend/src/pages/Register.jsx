import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const { register: registerUser } = useAuth();
  
  const password = watch("password", "");

  // Simple password strength calculation (for UI purposes)
  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) score++;
    if (pwd.match(/\d/)) score++;
    if (pwd.match(/[^a-zA-Z\d]/)) score++;
    return score;
  };

  const strength = calculateStrength(password);
  
  let strengthLabel = "";
  if (password.length > 0) {
    if (strength <= 1) strengthLabel = "Weak password";
    else if (strength === 2 || strength === 3) strengthLabel = "Good password";
    else strengthLabel = "Strong password";
  }

  const onSubmit = async (data) => {
    await registerUser({
      name: data.name,
      email: data.email,
      password: data.password
    });
  };

  const destinations = [
    { name: 'Santorini', icon: '🏛️' },
    { name: 'Swiss Alps', icon: '🚠' },
    { name: 'New York', icon: '🗽' }
  ];

  return (
    <AuthLayout
      leftTitle={"Start your\nadventure 🌍"}
      leftSubtitle="Join thousands of travelers planning smarter trips"
      destinations={destinations}
      showStats={false}
    >
      <div className="flex items-center gap-2.5 mb-7">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky to-teal flex items-center justify-center text-xl shadow-[0_2px_8px_rgba(74,144,217,0.3)]">✈️</div>
        <div className="font-serif text-[22px] font-bold text-text-heading">TravelWise</div>
      </div>
      
      <div className="font-serif text-[28px] font-bold text-text-heading leading-[1.2] mb-1.5">Start your adventure 🌍</div>
      <div className="text-sm text-text-muted mb-6">Create an account to begin planning your next trip.</div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="input-label">Full name</label>
        <div className="input-wrap">
          <span className="input-icon">👤</span>
          <input 
            className={`input ${errors.name ? 'border-coral' : ''}`}
            placeholder="Jane Doe" 
            {...register('name', { required: 'Full name is required' })} 
          />
        </div>
        {errors.name && <p className="text-coral text-xs mt-[-14px] mb-[18px]">{errors.name.message}</p>}

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
        <div className="input-wrap mb-0.5">
          <span className="input-icon">🔒</span>
          <input 
            className={`input ${errors.password ? 'border-coral' : ''}`}
            type="password" 
            placeholder="Create a password"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })} 
          />
        </div>
        
        {password.length > 0 && (
          <>
            <div className="flex gap-1 mt-2">
              <div className={`flex-1 h-[3px] rounded-sm ${strength >= 1 ? 'bg-sage' : 'bg-coral'}`}></div>
              <div className={`flex-1 h-[3px] rounded-sm ${strength >= 2 ? 'bg-sage' : 'bg-border'}`}></div>
              <div className={`flex-1 h-[3px] rounded-sm ${strength >= 4 ? 'bg-sage' : 'bg-border'}`}></div>
            </div>
            <div className={`text-[11px] font-medium mt-1 mb-[18px] ${strength >= 2 ? 'text-sage' : 'text-coral'}`}>
              {strengthLabel}
            </div>
          </>
        )}
        {errors.password && <p className="text-coral text-xs mt-1 mb-[18px]">{errors.password.message}</p>}
        {password.length === 0 && !errors.password && <div className="mb-[18px]"></div>}

        <label className="input-label">Confirm password</label>
        <div className="input-wrap">
          <span className="input-icon">🔒</span>
          <input 
            className={`input ${errors.confirmPassword ? 'border-coral' : ''}`}
            type="password" 
            placeholder="Re-enter your password"
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
          className="btn btn-primary w-full justify-center p-[13px] mt-2"
        >
          {isSubmitting ? 'Creating account...' : '✈️ Create account'}
        </button>
      </form>

      <div className="text-center mt-[22px] text-sm text-text-muted">
        Already exploring? <Link to="/login" className="text-sky font-semibold no-underline hover:underline">Sign in &rarr;</Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
