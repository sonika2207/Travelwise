import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Topbar from '../components/dashboard/Topbar';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../hooks/useTrips';
import { userApi } from '../api/userApi';

const FAQS = [
  {
    q: 'How do I add a new trip?',
    a: 'Click "+ New Trip" in the top bar, or the dashed "Create new trip" card at the end of your trips grid. Fill in the destination, dates, and trip type, then save.'
  },
  {
    q: 'Can I share my itinerary with someone else?',
    a: 'Currently, itineraries are private to your account. We are working on a sharing feature that will allow you to invite co-travelers and share read-only links soon!'
  },
  {
    q: 'How does the packing list percentage get calculated?',
    a: 'The packing list completion percentage is calculated based on the number of checked items divided by the total number of items on your packing list for that specific trip.'
  },
  {
    q: 'Can I change my budget currency after creating a trip?',
    a: 'Yes, you can navigate to the Budget tab of your trip and update the base currency in the settings icon next to the total budget.'
  },
  {
    q: 'How do I delete a trip?',
    a: 'Go to the My Trips page, click the three dots (options) on the trip card, and select "Delete". Please note that this action is permanent and cannot be undone.'
  }
];

const HelpSupport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trips } = useTrips();

  const [openFaq, setOpenFaq] = useState(0);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message.');
      return;
    }
    setSending(true);
    try {
      await userApi.sendSupportMessage(message);
      toast.success('Message sent! We will get back to you within 24 hours.');
      setMessage('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  const filteredFAQS = FAQS.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Topbar title="Help & Support" />

        <div style={{ padding: '32px', flex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            
            {/* ── Hero Section ── */}
            <div style={{
              background: 'linear-gradient(135deg, var(--tw-sky, #4A90D9) 0%, var(--tw-teal, #4ECDC4) 100%)',
              borderRadius: '28px', padding: '36px 40px', marginBottom: '28px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                How can we help? 👋
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginBottom: '20px' }}>
                Search our help center or browse topics below
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.35)', borderRadius: '16px',
                padding: '12px 18px', maxWidth: '460px', margin: '0 auto', color: '#fff',
              }}>
                <span>🔍</span>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search articles, e.g. "add expense"'
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#fff', width: '100%', fontSize: '14px',
                  }}
                />
              </div>
            </div>

            {/* ── Topics Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '32px' }}>
              <div style={{ background: 'var(--tw-bg-card, #fff)', border: '1px solid var(--tw-border-light)', borderRadius: '16px', padding: '20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '26px', marginBottom: '10px', color: 'var(--tw-sky, #4A90D9)' }}>✈️</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tw-text-heading)' }}>Trips &amp; itinerary</div>
              </div>
              <div style={{ background: 'var(--tw-bg-card, #fff)', border: '1px solid var(--tw-border-light)', borderRadius: '16px', padding: '20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '26px', marginBottom: '10px', color: 'var(--tw-sage, #6BCB77)' }}>🏖️</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tw-text-heading)' }}>Packing lists</div>
              </div>
              <div style={{ background: 'var(--tw-bg-card, #fff)', border: '1px solid var(--tw-border-light)', borderRadius: '16px', padding: '20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '26px', marginBottom: '10px', color: '#5E35B1' }}>💵</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tw-text-heading)' }}>Budget &amp; expenses</div>
              </div>
              <div style={{ background: 'var(--tw-bg-card, #fff)', border: '1px solid var(--tw-border-light)', borderRadius: '16px', padding: '20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '26px', marginBottom: '10px', color: 'var(--tw-peach, #FFAA85)' }}>👤</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tw-text-heading)' }}>Account &amp; billing</div>
              </div>
            </div>

            {/* ── FAQ Section ── */}
            <div style={{ background: 'var(--tw-bg-card, #fff)', border: '1px solid var(--tw-border-light)', borderRadius: '16px', padding: '28px', marginBottom: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '19px', fontWeight: 700, color: 'var(--tw-text-heading)', marginBottom: '16px' }}>
                Frequently asked questions
              </div>
              
              <div>
                {filteredFAQS.length === 0 ? (
                  <div style={{ padding: '32px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--tw-text-heading)', marginBottom: '4px' }}>No frequently asked questions found</div>
                    <div style={{ fontSize: '13px', color: 'var(--tw-text-muted)' }}>We couldn't find any FAQs matching "{searchQuery}".</div>
                  </div>
                ) : (
                  filteredFAQS.map((faq, idx) => {
                    const isOpen = openFaq === idx || searchQuery.length > 0;
                    return (
                      <div key={idx} style={{ borderBottom: idx < filteredFAQS.length - 1 ? '1px solid var(--tw-border-light)' : 'none', padding: '16px 0', paddingTop: idx === 0 ? 0 : '16px' }}>
                        <div 
                          onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, color: 'var(--tw-text-heading)', cursor: 'pointer' }}
                        >
                          {faq.q}
                          <span style={{ color: 'var(--tw-text-muted)', fontSize: '12px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            ▼
                          </span>
                        </div>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ fontSize: '13px', color: 'var(--tw-text-muted)', lineHeight: 1.7, marginTop: '10px', paddingRight: '20px' }}>
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Contact Form ── */}
            <div style={{ background: 'var(--tw-bg-card, #fff)', border: '1px solid var(--tw-border-light)', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '19px', fontWeight: 700, color: 'var(--tw-text-heading)', marginBottom: '6px' }}>
                Still need help?
              </div>
              <div style={{ fontSize: '13px', color: 'var(--tw-text-muted)', marginBottom: '20px' }}>
                Send us a message and we'll get back to you within 24 hours.
              </div>
              
              <form onSubmit={handleSendMessage}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--tw-text-muted)', marginBottom: '6px' }}>Your name</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '13px', fontSize: '16px', color: 'var(--tw-text-light)' }}>👤</span>
                      <input 
                        readOnly
                        value={user?.name || ''}
                        style={{ width: '100%', padding: '11px 14px 11px 40px', background: '#F0F0F0', border: '1.5px solid var(--tw-border)', borderRadius: '12px', fontSize: '14px', color: 'var(--tw-text-body)', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--tw-text-muted)', marginBottom: '6px' }}>Email</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '13px', fontSize: '16px', color: 'var(--tw-text-light)' }}>✉️</span>
                      <input 
                        readOnly
                        value={user?.email || ''}
                        style={{ width: '100%', padding: '11px 14px 11px 40px', background: '#F0F0F0', border: '1.5px solid var(--tw-border)', borderRadius: '12px', fontSize: '14px', color: 'var(--tw-text-body)', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>
                </div>
                
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--tw-text-muted)', marginBottom: '6px' }}>What do you need help with?</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue..."
                  style={{ width: '100%', padding: '14px', background: 'var(--tw-bg-input, #FAFAFA)', border: '1.5px solid var(--tw-border)', borderRadius: '12px', fontSize: '14px', color: 'var(--tw-text-body)', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button 
                    type="submit"
                    disabled={sending}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '10px 22px', borderRadius: '12px',
                      fontSize: '14px', fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer',
                      border: 'none', background: sending ? '#A0AEC0' : 'var(--tw-sky, #4A90D9)', color: '#fff',
                      boxShadow: sending ? 'none' : '0 2px 12px rgba(74,144,217,0.28)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {sending ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            </div>

          </motion.div>
      </div>
    </>
  );
};

export default HelpSupport;
