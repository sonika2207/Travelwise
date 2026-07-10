import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Topbar from '../components/dashboard/Topbar';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../hooks/useTrips';
import { userApi } from '../api/userApi';
import { useMemo } from 'react';

const TABS = [
  { key: 'profile',   icon: '👤', label: 'Profile' },
  { key: 'password',  icon: '🔒', label: 'Password & Security' },
  { key: 'danger',    icon: '⚠️',  label: 'Danger Zone' },
];

// ─── small helpers ────────────────────────────────────────────────────────────
const Section = ({ title, sub, danger, children }) => (
  <div style={{
    background: danger ? 'var(--tw-coral-light, #FFF2F2)' : 'var(--tw-bg-card)',
    border: danger
      ? '1.5px solid rgba(255,139,139,0.35)'
      : '1px solid var(--tw-border-light)',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    padding: '28px',
    marginBottom: '20px',
  }}>
    <div style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: '19px', fontWeight: 700,
      color: danger ? '#C0392B' : 'var(--tw-text-heading)',
      marginBottom: '4px',
    }}>{title}</div>
    <div style={{
      fontSize: '13px',
      color: danger ? '#8a5a52' : 'var(--tw-text-muted)',
      marginBottom: '22px',
    }}>{sub}</div>
    {children}
  </div>
);

const Field = ({ label, icon, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--tw-text-muted)', marginBottom: '6px' }}>
      {label}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: '13px', fontSize: '16px', zIndex: 1 }}>{icon}</span>
      {children}
    </div>
  </div>
);

const inputStyle = {
  width: '100%', padding: '11px 14px 11px 40px',
  background: 'var(--tw-bg-input, #FAFAFA)',
  border: '1.5px solid var(--tw-border)',
  borderRadius: '12px', fontSize: '14px',
  color: 'var(--tw-text-body)',
  fontFamily: 'inherit', outline: 'none',
  transition: 'border-color 0.15s',
};

const BtnPrimary = ({ children, onClick, disabled, type = 'button', style = {} }) => (
  <button type={type} onClick={onClick} disabled={disabled}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '10px 22px', borderRadius: '12px',
      fontSize: '14px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
      border: 'none', outline: 'none',
      background: disabled ? '#A0AEC0' : 'var(--tw-sky, #4A90D9)',
      color: '#fff',
      boxShadow: disabled ? 'none' : '0 2px 12px rgba(74,144,217,0.28)',
      transition: 'all 0.2s',
      ...style,
    }}>
    {children}
  </button>
);

const BtnSecondary = ({ children, onClick }) => (
  <button type="button" onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '10px 22px', borderRadius: '12px',
      fontSize: '14px', fontWeight: 600, cursor: 'pointer',
      border: '1.5px solid var(--tw-border)', outline: 'none',
      background: 'var(--tw-bg-subtle, #F5F3EE)',
      color: 'var(--tw-text-body)', transition: 'all 0.2s',
    }}>
    {children}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// Account Settings Page
// ─────────────────────────────────────────────────────────────────────────────

const AccountSettings = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { trips } = useTrips();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Profile form state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    homeCity: '',
    homeCurrency: '',
    profilePhotoUrl: '',
  });
  const fileInputRef = useRef(null);
  const [profileOriginal, setProfileOriginal] = useState(null);

  // Password form state
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Load profile from API  // Password form state

  useEffect(() => {
    userApi.getProfile().then(data => {
      const p = { 
        name: data.name || '', 
        email: data.email || '', 
        homeCity: data.homeCity || '', 
        homeCurrency: data.homeCurrency || '',
        profilePhotoUrl: data.profilePhotoUrl || ''
      };
      setProfile(p);
      setProfileOriginal(p);
    }).catch(() => {
      // fallback to local cache
      setProfile({ name: user?.name || '', email: user?.email || '', homeCity: '', homeCurrency: '', profilePhotoUrl: user?.profilePhotoUrl || '' });
    });
  }, []);

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const profileDirty = profileOriginal && (
    profile.name !== profileOriginal.name ||
    profile.homeCity !== profileOriginal.homeCity ||
    profile.homeCurrency !== profileOriginal.homeCurrency
  );

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profile.name.trim()) { toast.error('Name cannot be empty.'); return; }
    setProfileSaving(true);
    try {
      const updated = await userApi.updateProfile({
        name: profile.name.trim(),
        homeCity: profile.homeCity.trim(),
        homeCurrency: profile.homeCurrency.trim().toUpperCase(),
      });
      updateUser({ name: updated.name, email: updated.email });
      setProfileOriginal({ ...profile, name: updated.name });
      toast.success('Profile updated successfully!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('File must be less than 2MB'); return; }
    try {
      const url = await userApi.uploadProfilePhoto(file);
      setProfile(p => ({ ...p, profilePhotoUrl: url }));
      updateUser({ profilePhotoUrl: url });
      toast.success('Profile photo updated!');
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) { toast.error('New passwords do not match.'); return; }
    if (pw.newPassword.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setPasswordSaving(true);
    try {
      await userApi.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed successfully!');
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to change password. Check your current password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // ── Delete account ──────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    try {
      await userApi.deleteAccount();
      toast.info('Account deleted. Goodbye!');
      logout();
    } catch (e) {
      toast.error('Failed to delete account. Please try again.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Topbar title="Account Settings" />

      <div style={{ padding: '32px', flex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

              {/* Settings layout: nav | content */}
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>

                {/* ── Left nav ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {TABS.map(tab => (
                    <div key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: '12px',
                        fontSize: '14px', fontWeight: tab.key === activeTab ? 600 : 500,
                        color: tab.key === activeTab ? 'var(--tw-sky, #4A90D9)' : 'var(--tw-text-muted)',
                        background: tab.key === activeTab ? 'var(--tw-sky-light, #EBF4FF)' : 'transparent',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      <span>{tab.icon}</span> {tab.label}
                    </div>
                  ))}
                </div>

                {/* ── Right content ── */}
                <div>
                  <AnimatePresence mode="wait">

                    {/* ── PROFILE TAB ── */}
                    {activeTab === 'profile' && (
                      <motion.div key="profile" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                        <Section title="Profile" sub="Update your photo and personal details here.">

                          {/* Avatar row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
                            <div style={{
                              width: '72px', height: '72px', borderRadius: '50%',
                              background: profile.profilePhotoUrl ? `url(${profile.profilePhotoUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #4A90D9, #4ECDC4)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '26px', fontWeight: 700, flexShrink: 0,
                              border: profile.profilePhotoUrl ? '2px solid var(--tw-border)' : 'none'
                            }}>
                              {!profile.profilePhotoUrl && initials}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <input 
                                type="file" 
                                accept="image/jpeg, image/png" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handlePhotoUpload} 
                              />
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                  padding: '8px 16px', background: 'var(--tw-bg-subtle, #f3f4f6)',
                                  border: 'none', borderRadius: '8px', fontSize: '13px',
                                  fontWeight: 700, color: 'var(--tw-text-heading)',
                                  cursor: 'pointer', alignSelf: 'flex-start'
                                }}
                              >
                                Change photo
                              </button>
                              <div style={{ fontSize: '11px', color: 'var(--tw-text-light)' }}>
                                JPG or PNG. Max 2MB.
                              </div>
                            </div>
                          </div>

                          {/* Form grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
                            <Field label="Full name" icon="👤">
                              <input style={inputStyle} value={profile.name}
                                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                placeholder="Your full name" />
                            </Field>
                            <Field label="Email" icon="✉️">
                              <input style={{ ...inputStyle, background: '#F0F0F0', cursor: 'not-allowed' }}
                                value={profile.email} readOnly />
                            </Field>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
                            <Field label="Home city" icon="📍">
                              <input style={inputStyle} value={profile.homeCity}
                                onChange={e => setProfile(p => ({ ...p, homeCity: e.target.value }))}
                                placeholder="e.g. Chennai, India" />
                            </Field>
                            <Field label="Home currency" icon="💱">
                              <input style={inputStyle} value={profile.homeCurrency}
                                onChange={e => setProfile(p => ({ ...p, homeCurrency: e.target.value }))}
                                placeholder="e.g. INR, USD" maxLength={4} />
                            </Field>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <BtnSecondary onClick={() => setProfile(profileOriginal || profile)}>Cancel</BtnSecondary>
                            <BtnPrimary onClick={handleSaveProfile} disabled={profileSaving || !profileDirty}>
                              {profileSaving ? '⏳ Saving…' : '✓ Save changes'}
                            </BtnPrimary>
                          </div>
                        </Section>
                      </motion.div>
                    )}

                    {/* ── PASSWORD TAB ── */}
                    {activeTab === 'password' && (
                      <motion.div key="password" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                        <Section title="Password &amp; Security" sub="Keep your account secure by using a strong, unique password.">
                          <form onSubmit={handleChangePassword}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px', maxWidth: '480px', marginBottom: '24px' }}>

                              <Field label="Current password" icon="🔒">
                                <input style={inputStyle} type={showPw.current ? 'text' : 'password'}
                                  value={pw.currentPassword}
                                  onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))}
                                  placeholder="Enter current password" required />
                                <span onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}
                                  style={{ position: 'absolute', right: '13px', cursor: 'pointer', fontSize: '16px', userSelect: 'none' }}>
                                  {showPw.current ? '🙈' : '👁️'}
                                </span>
                              </Field>

                              <Field label="New password" icon="🔑">
                                <input style={inputStyle} type={showPw.new ? 'text' : 'password'}
                                  value={pw.newPassword}
                                  onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))}
                                  placeholder="At least 6 characters" required />
                                <span onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}
                                  style={{ position: 'absolute', right: '13px', cursor: 'pointer', fontSize: '16px', userSelect: 'none' }}>
                                  {showPw.new ? '🙈' : '👁️'}
                                </span>
                              </Field>

                              <Field label="Confirm new password" icon="🔑">
                                <input style={inputStyle} type={showPw.confirm ? 'text' : 'password'}
                                  value={pw.confirmPassword}
                                  onChange={e => setPw(p => ({ ...p, confirmPassword: e.target.value }))}
                                  placeholder="Repeat new password" required />
                                <span onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                                  style={{ position: 'absolute', right: '13px', cursor: 'pointer', fontSize: '16px', userSelect: 'none' }}>
                                  {showPw.confirm ? '🙈' : '👁️'}
                                </span>
                              </Field>

                              {/* Strength indicator */}
                              {pw.newPassword && (
                                <div>
                                  <div style={{ fontSize: '12px', color: 'var(--tw-text-muted)', marginBottom: '6px' }}>
                                    Password strength:&nbsp;
                                    <strong style={{ color: pw.newPassword.length >= 12 ? '#6BCB77' : pw.newPassword.length >= 8 ? '#F9C74F' : '#FF8B8B' }}>
                                      {pw.newPassword.length >= 12 ? 'Strong' : pw.newPassword.length >= 8 ? 'Medium' : 'Weak'}
                                    </strong>
                                  </div>
                                  <div style={{ height: '4px', background: '#E8E2D9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                      height: '100%', borderRadius: '4px', transition: 'width 0.3s',
                                      width: pw.newPassword.length >= 12 ? '100%' : pw.newPassword.length >= 8 ? '60%' : '25%',
                                      background: pw.newPassword.length >= 12 ? '#6BCB77' : pw.newPassword.length >= 8 ? '#F9C74F' : '#FF8B8B',
                                    }} />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                              <BtnSecondary onClick={() => setPw({ currentPassword: '', newPassword: '', confirmPassword: '' })}>Clear</BtnSecondary>
                              <BtnPrimary type="submit" disabled={passwordSaving}>
                                {passwordSaving ? '⏳ Saving…' : '🔒 Update password'}
                              </BtnPrimary>
                            </div>
                          </form>
                        </Section>
                      </motion.div>
                    )}

                    {/* ── DANGER ZONE TAB ── */}
                    {activeTab === 'danger' && (
                      <motion.div key="danger" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                        <Section
                          title="Danger Zone"
                          sub="Deleting your account permanently removes all trips, itineraries, and saved data. This cannot be undone."
                          danger
                        >
                          <button
                            onClick={() => setDeleteModal(true)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '8px',
                              padding: '10px 22px', borderRadius: '12px',
                              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                              border: 'none', background: '#E53E3E', color: '#fff',
                              boxShadow: '0 2px 12px rgba(229,62,62,0.3)',
                            }}>
                            🗑️ Delete account
                          </button>
                        </Section>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </div>

            </motion.div>
          </div>

      {/* ── Delete account confirmation modal ── */}
      <AnimatePresence>
        {deleteModal && (
          <div onClick={e => { if (e.target === e.currentTarget) setDeleteModal(false); }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
            }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.22 }}
              style={{
                background: 'var(--tw-bg-card, #fff)', borderRadius: '20px',
                padding: '36px 32px 28px', width: '420px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.2)', textAlign: 'center',
              }}>

              {/* Icon */}
              <div style={{
                width: '60px', height: '60px', borderRadius: '18px',
                background: '#FFF2F2', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
              }}>🗑️</div>

              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--tw-text-heading)', marginBottom: '8px' }}>
                Delete your account?
              </div>
              <div style={{ fontSize: '13px', color: 'var(--tw-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                This will permanently delete your account, all your trips, itineraries, and data.
                <strong style={{ color: '#E53E3E' }}> This action cannot be undone.</strong>
              </div>

              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', color: 'var(--tw-text-muted)', display: 'block', marginBottom: '8px' }}>
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  style={{
                    ...inputStyle, paddingLeft: '14px',
                    borderColor: deleteConfirm === 'DELETE' ? '#6BCB77' : 'var(--tw-border)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <BtnSecondary onClick={() => { setDeleteModal(false); setDeleteConfirm(''); }}>
                  Cancel
                </BtnSecondary>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== 'DELETE'}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '12px',
                    border: 'none',
                    background: deleteConfirm === 'DELETE' ? '#E53E3E' : '#A0AEC0',
                    fontSize: '14px', fontWeight: 600, color: '#fff',
                    cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed',
                    transition: 'background 0.15s',
                  }}>
                  Delete account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccountSettings;
