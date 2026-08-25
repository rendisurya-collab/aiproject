import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchBar({ onSearch, onFilter }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari gaun, dekorasi, aksesoris..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          aria-label="Cari produk"
        />
      </div>
      {onFilter && (
        <button
          type="button"
          onClick={onFilter}
          className="flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
          aria-label="Filter produk"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
        </button>
      )}
    </form>
  );
}
