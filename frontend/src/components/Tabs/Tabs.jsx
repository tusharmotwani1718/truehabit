import React, { useState } from "react";

const Tabs = ({ tabs, onTabsChange }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg dark:shadow-zinc-800 flex flex-col h-full">
      {/* Fixed Tab Headers */}
      <div className="flex border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 sticky top-0 z-10">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveTab(index);
              onTabsChange(index);
            }}
            className={`px-4 py-3 font-medium text-sm transition-colors flex-1 text-center ${
              activeTab === index
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable Content with Themed Scrollbar */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <div className="p-4 bg-white dark:bg-zinc-800 py-7">
          {tabs[activeTab].content}
        </div>
      </div>
    </div>
  );
};

export default Tabs;