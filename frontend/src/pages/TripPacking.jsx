import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { packingApi } from '../api/packingApi';
import { Check, Edit, Trash2, Plus } from 'lucide-react';

const CATEGORY_ICONS = {
  'Clothing': '👕',
  'Toiletries': '🧴',
  'Documents': '📄',
  'Health': '💊',
  'Electronics': '🔌',
  'Miscellaneous': '🎭'
};

const TripPacking = () => {
  const { trip } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Clothing');
  const [isGenerating, setIsGenerating] = useState(false);

  const loadPackingList = useCallback(async () => {
    if (!trip?.id) return;
    try {
      setLoading(true);
      let data = await packingApi.getItems(trip.id);
      
      // If list is empty, auto-generate it
      if (data.length === 0) {
        setIsGenerating(true);
        await packingApi.generate(trip.id);
        data = await packingApi.getItems(trip.id);
        setIsGenerating(false);
      }
      setItems(data);
    } catch (err) {
      toast.error('Failed to load packing list.');
      setIsGenerating(false);
    } finally {
      setLoading(false);
    }
  }, [trip?.id]);

  useEffect(() => {
    loadPackingList();
  }, [loadPackingList]);

  const toggleItem = async (itemId) => {
    // Optimistic UI update
    setItems((prev) => prev.map((item) => item.id === itemId ? { ...item, checked: !item.checked } : item));
    try {
      await packingApi.toggle(itemId);
    } catch (err) {
      toast.error('Failed to update item status.');
      // Revert on error
      setItems((prev) => prev.map((item) => item.id === itemId ? { ...item, checked: !item.checked } : item));
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await packingApi.delete(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      toast.error('Failed to delete item.');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      const added = await packingApi.addCustom(trip.id, {
        itemName: newItemName.trim(),
        category: newItemCategory
      });
      setItems((prev) => [...prev, added]);
      setNewItemName('');
      setShowAddForm(false);
    } catch (err) {
      toast.error('Failed to add custom item.');
    }
  };

  if (loading || isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted gap-3">
        <div className="text-4xl animate-pulse">🎒</div>
        <div className="text-sm font-medium">
          {isGenerating ? `Generating smart packing list for ${trip?.destinationCity}…` : 'Loading packing list…'}
        </div>
      </div>
    );
  }

  // Compute stats
  const totalItems = items.length;
  const packedItems = items.filter(i => i.checked).length;
  const progressPct = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
  
  // Compute categories
  const categoriesMap = new Map();
  items.forEach(item => {
    const cat = item.category || 'Miscellaneous';
    if (!categoriesMap.has(cat)) categoriesMap.set(cat, { total: 0, packed: 0 });
    const stats = categoriesMap.get(cat);
    stats.total += 1;
    if (item.checked) stats.packed += 1;
  });

  const categories = Array.from(categoriesMap.keys()).sort();
  
  // Filter items
  const displayItems = activeCategory === 'All' 
    ? items 
    : items.filter(item => (item.category || 'Miscellaneous') === activeCategory);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      
      {/* ── Progress Hero ── */}
      <div className="packing-hero">
        <div className="packing-hero-title">
          {progressPct === 100 ? "You're all packed!" : `You're ${progressPct}% packed for ${trip?.destinationCity || 'your trip'}!`}
        </div>
        <div className="flex items-center">
          <div className="packing-pct">{progressPct}%</div>
          <div className="flex-1">
            <div className="packing-progress-track">
              <div className="packing-progress-fill" style={{ width: `${progressPct}%` }}></div>
            </div>
            <div className="packing-progress-label">
              <span>{packedItems} of {totalItems} items checked</span>
              <span>{totalItems - packedItems} remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="packing-categories">
        <div 
          className={`packing-category-tab ${activeCategory === 'All' ? 'active' : ''}`}
          onClick={() => setActiveCategory('All')}
        >
          🎒 All
          <span className="cat-count">{packedItems}/{totalItems}</span>
        </div>
        {categories.map(cat => {
          const stats = categoriesMap.get(cat);
          return (
            <div 
              key={cat}
              className={`packing-category-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {CATEGORY_ICONS[cat] || '🏷️'} {cat}
              <span className="cat-count">{stats.packed}/{stats.total}</span>
            </div>
          );
        })}
      </div>

      {/* ── Items List ── */}
      <div className="card mb-4">
        {displayItems.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No items found in this category.</div>
        ) : (
          displayItems.map((item) => (
            <div key={item.id} className="packing-item-row group">
              <div 
                className={`packing-checkbox ${item.checked ? 'checked' : ''}`}
                onClick={() => toggleItem(item.id)}
              >
                {item.checked && <Check size={14} strokeWidth={4} />}
              </div>
              <div className={`packing-item-name ${item.checked ? 'checked' : ''}`}>
                {item.itemName}
                {item.customItem && <span className="ml-2 text-[10px] bg-bg-subtle text-text-muted px-2 py-0.5 rounded-full border border-border">Custom</span>}
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="btn-icon" 
                  onClick={() => deleteItem(item.id)}
                  title="Delete item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Add Custom Item ── */}
      {!showAddForm ? (
        <button 
          className="add-activity-btn w-auto ml-0 border-[2px] border-dashed border-border rounded-lg p-[14px_18px] text-text-muted cursor-pointer hover:bg-bg-subtle transition-colors"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={18} /> Add item
        </button>
      ) : (
        <form onSubmit={handleAddItem} className="card p-4 flex gap-4 items-center bg-bg-subtle border-dashed">
          <div className="flex-1">
            <input 
              type="text" 
              className="input w-full"
              placeholder="Item name (e.g. Camera)" 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <select 
              className="input w-40" 
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
            >
              <option value="Clothing">Clothing</option>
              <option value="Toiletries">Toiletries</option>
              <option value="Documents">Documents</option>
              <option value="Health">Health</option>
              <option value="Electronics">Electronics</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Add</button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
        </form>
      )}

    </motion.div>
  );
};

export default TripPacking;
