import React, { useState } from 'react';
import { Search } from 'lucide-react';

function SearchBar({ placeholder = "Search...", onSearch = () => {} }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative flex items-center w-full overflow-hidden rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 transition-all">
        <div className="flex items-center justify-center px-3 text-gray-400 dark:text-gray-500">
          <Search size={18} />
        </div>
        <input
          type="search"
          className="w-full py-2 pr-4 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>
    </div>
  );
}

export default SearchBar;