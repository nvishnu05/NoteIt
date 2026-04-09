import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 mb-16 animate-fade-in">
      <div className="relative flex-1 w-full group">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 dark:group-focus-within:text-stone-100 transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Filter your thoughts..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent border-none pl-10 pr-10 py-4 text-lg font-light focus:ring-0 placeholder:text-stone-300 dark:placeholder:text-stone-800 text-stone-900 dark:text-stone-100 transition-all"
        />
        {searchTerm && (
          <button 
            onClick={() => onSearchChange('')}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-stone-300 hover:text-stone-600 dark:hover:text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-stone-100 dark:bg-stone-900 group-focus-within:bg-stone-900 dark:group-focus-within:bg-stone-100 transition-all duration-500" />
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative group w-full md:w-auto">
          <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full md:w-48 pl-10 pr-8 py-3 bg-stone-50 dark:bg-stone-900/50 rounded-full border-none ring-1 ring-stone-100 dark:ring-stone-800 focus:ring-stone-900 appearance-none text-[11px] uppercase tracking-widest font-semibold text-stone-600 dark:text-stone-400 cursor-pointer transition-all"
          >
            <option value="">All Streams</option>
            {categories.map(category => (
              <option key={category} value={category} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;