import React from 'react';

const TABS = ['All', 'Upcoming', 'Ongoing', 'Completed', 'Planning'];

const FilterTabs = ({ activeTab, onTabChange }) => {
  return (
    <div
      className="flex gap-1.5 mb-5 p-1 w-fit rounded-2xl border border-[var(--tw-border-light)] bg-[var(--tw-bg-subtle)]"
    >
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-[7px] rounded-xl text-[13px] font-medium cursor-pointer border-none transition-all
            ${activeTab === tab
              ? 'bg-[var(--tw-filter-active-bg)] text-[var(--tw-filter-active-color)] font-semibold'
              : 'bg-transparent text-[var(--tw-text-muted)]'
            }`}
          style={activeTab === tab ? { boxShadow: 'var(--tw-shadow-stat)' } : {}}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
