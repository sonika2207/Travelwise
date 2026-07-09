import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { expenseApi } from '../api/expenseApi';
import { Edit2, Trash2 } from 'lucide-react';

const CATEGORY_MAP = {
  STAY: { label: 'Accommodation', color: '#4A90D9', bg: 'var(--tw-sky-light)', iconBg: 'var(--tw-sand)', iconColor: 'var(--tw-sand-dark)', icon: '🏨' },
  FOOD: { label: 'Food', color: '#6BCB77', bg: 'var(--tw-sage-light)', iconBg: 'var(--tw-peach-light)', iconColor: 'var(--tw-peach)', icon: '🍽️' },
  TRAVEL: { label: 'Transport', color: '#4ECDC4', bg: 'var(--tw-teal-light)', iconBg: 'var(--tw-sky-light)', iconColor: 'var(--tw-sky)', icon: '✈️' },
  ACTIVITY: { label: 'Activities', color: '#F9C74F', bg: 'var(--tw-sunset-light)', iconBg: 'var(--tw-teal-light)', iconColor: 'var(--tw-teal)', icon: '🎢' },
  SHOPPING: { label: 'Shopping', color: '#C9B8FF', bg: 'var(--tw-lavender-light)', iconBg: 'var(--tw-lavender-light)', iconColor: '#5E35B1', icon: '🛍️' },
  OTHER: { label: 'Other', color: '#A0AEC0', bg: 'var(--tw-bg-subtle)', iconBg: 'var(--tw-bg-subtle)', iconColor: 'var(--tw-text-muted)', icon: '✨' }
};

const TripBudget = () => {
  const { trip, setTrip } = useOutletContext();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({ note: '', amount: '', category: 'FOOD', expenseDate: '' });

  const loadData = useCallback(async () => {
    if (!trip?.id) return;
    try {
      setLoading(true);
      const [expenseData, summaryData] = await Promise.all([
        expenseApi.getTripExpenses(trip.id),
        expenseApi.getExpenseSummary(trip.id)
      ]);
      setExpenses(expenseData);
      setSummary(summaryData);
    } catch (err) {
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  }, [trip?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseApi.deleteExpense(id);
      toast.success('Expense deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense.id);
    setFormData({
      note: expense.note,
      amount: expense.amount,
      category: expense.category,
      expenseDate: expense.expenseDate
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.note || !formData.amount || !formData.expenseDate) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingExpense) {
        await expenseApi.updateExpense(editingExpense, formData);
        toast.success('Expense updated');
      } else {
        await expenseApi.addExpense(trip.id, formData);
        toast.success('Expense added');
      }
      setShowForm(false);
      setEditingExpense(null);
      setFormData({ note: '', amount: '', category: 'FOOD', expenseDate: '' });
      loadData();
    } catch (err) {
      toast.error(editingExpense ? 'Failed to update expense' : 'Failed to add expense');
    }
  };

  // Calculations
  const totalBudget = trip?.budget || 0;
  const totalSpent = summary?.totalAmount || 0;
  const remaining = totalBudget - totalSpent;
  const spentPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  // Use the trip's destination currency (which now correctly reflects the user's choice)
  const currency = trip?.destinationCurrency || 'USD';

  const categoryTotals = summary?.categoryTotals || {};
  const donutData = useMemo(() => {
    let currentOffset = 0;
    return Object.entries(categoryTotals)
      .filter(([_, val]) => val > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amount]) => {
        const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
        // Stroke dasharray format: "length gap" for a circle of circumference 100
        const dashArray = `${pct} 100`;
        const dashOffset = -currentOffset;
        currentOffset += pct;
        return { cat, amount, pct, dashArray, dashOffset };
      });
  }, [categoryTotals, totalSpent]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted gap-3">
        <div className="text-4xl animate-pulse">💸</div>
        <div className="text-sm font-medium">Calculating budget…</div>
      </div>
    );
  }

  const formatMoney = (val) => {
    const num = Number(val) || 0;
    if (currency) {
      try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(num);
      } catch { }
    }
    // Fallback: plain number with commas
    return num.toLocaleString('en-US');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

      {/* ── Budget Overview ── */}
      <div className="budget-overview">
        <div className="budget-card">
          <div className="budget-card-label">Total budget</div>
          <div className="budget-card-amount">
            {formatMoney(totalBudget)} <span className="text-[13px] text-text-muted font-medium">{currency}</span>
          </div>
          <div className="budget-card-sub">Set for this trip</div>
          <div className="h-[5px] bg-border-light rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-sky transition-all duration-500" style={{ width: `${Math.min(100, spentPct)}%` }}></div>
          </div>
        </div>

        <div className="budget-card spent">
          <div className="budget-card-label">Total spent</div>
          <div className="budget-card-amount">{formatMoney(totalSpent)}</div>
          <div className="budget-card-sub">{spentPct}% of budget used</div>
          <div className="h-[5px] bg-border-light rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-coral transition-all duration-500" style={{ width: `${Math.min(100, spentPct)}%` }}></div>
          </div>
        </div>

        <div className="budget-card remaining">
          <div className="budget-card-label">Remaining</div>
          <div className="budget-card-amount">{formatMoney(remaining)}</div>
          <div className="budget-card-sub">{remaining >= 0 ? 'Safe to spend' : 'Over budget!'}</div>
        </div>
      </div>

      <div className="budget-content">
        {/* ── Chart Card ── */}
        <div className="budget-chart-card">
          <div className="donut-wrap">
            <svg width="180" height="180" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--tw-sky-light)" strokeWidth="6"></circle>
              {donutData.map((d, i) => {
                const conf = CATEGORY_MAP[d.cat] || CATEGORY_MAP['OTHER'];
                return (
                  <circle
                    key={d.cat}
                    cx="21" cy="21" r="15.9" fill="none"
                    stroke={conf.color} strokeWidth="6"
                    strokeDasharray={d.dashArray}
                    strokeDashoffset={d.dashOffset}
                    className="transition-all duration-1000 ease-out"
                  />
                );
              })}
            </svg>
          </div>
          <div className="mt-4">
            {donutData.length === 0 && <div className="text-center text-sm text-text-muted">No expenses yet</div>}
            {donutData.map(d => {
              const conf = CATEGORY_MAP[d.cat] || CATEGORY_MAP['OTHER'];
              return (
                <div key={d.cat} className="budget-legend-item">
                  <div className="budget-legend-dot" style={{ background: conf.color }}></div>
                  <span>{conf.label}</span>
                  <span className="budget-legend-pct">{d.pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Expenses Table ── */}
        <div className="expense-table-card">
          <div className="expense-table-header flex-wrap gap-4">
            <div className="font-semibold text-text-heading">Expenses</div>
            <button
              className="btn btn-primary btn-sm px-4 py-2 text-xs"
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm) {
                  setEditingExpense(null);
                  setFormData({ note: '', amount: '', category: 'FOOD', expenseDate: new Date().toISOString().split('T')[0] });
                }
              }}
            >
              {showForm ? 'Cancel' : '+ Add expense'}
            </button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-4 border-b border-border-light bg-bg-subtle overflow-hidden"
                onSubmit={handleSubmit}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <div className="md:col-span-2">
                    <label className="input-label">Description</label>
                    <input type="text" className="input py-2 pl-3" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} required />
                  </div>
                  <div>
                    <label className="input-label">Amount ({currency})</label>
                    <input type="number" step="0.01" min="0" className="input py-2 pl-3" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                  </div>
                  <div>
                    <label className="input-label">Category</label>
                    <select className="input py-2 pl-3" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      {Object.entries(CATEGORY_MAP).map(([key, conf]) => (
                        <option key={key} value={key}>{conf.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Date</label>
                    <input type="date" className="input py-2 pl-3" value={formData.expenseDate} onChange={e => setFormData({ ...formData, expenseDate: e.target.value })} required />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary text-xs py-2">{editingExpense ? 'Save Changes' : 'Add Expense'}</button>
                  <button type="button" className="btn btn-secondary text-xs py-2" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-text-muted">No expenses recorded yet.</td>
                  </tr>
                ) : (
                  expenses.map(exp => {
                    const conf = CATEGORY_MAP[exp.category] || CATEGORY_MAP['OTHER'];
                    return (
                      <tr key={exp.id} className="group">
                        <td>
                          <span className="font-medium text-text-body">{exp.note}</span>
                        </td>
                        <td className="text-text-muted">{conf.label}</td>
                        <td className="expense-amount">{formatMoney(exp.amount)}</td>
                        <td className="text-text-muted text-sm">{new Date(exp.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        <td>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="btn-icon w-7 h-7" onClick={() => handleEditClick(exp)} title="Edit"><Edit2 size={14} /></button>
                            <button className="btn-icon w-7 h-7 text-coral" onClick={() => handleDelete(exp.id)} title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default TripBudget;
