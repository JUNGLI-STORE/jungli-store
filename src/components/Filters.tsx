"use client";
import { Search, Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SearchFilters({ onSearch, onFilterChange }: { onSearch: (val: string) => void, onFilterChange: (category: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const categories = ["All", "Retro", "High-Top", "Lows", "Limited"];

  // Debouncing: Prevents the database from being hit on every single keystroke (No Lag)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 400); // Wait 400ms after user stops typing
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
      
      {/* 1. Live Search Bar */}
      <div className="relative w-full md:w-1/2 group">
        <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-focus-within:translate-x-2 group-focus-within:translate-y-2 transition-all"></div>
        <div className="relative flex items-center bg-white border-4 border-black p-1">
          <Search className="ml-4 text-gray-400" size={24} />
          <input 
            type="text" 
            placeholder="HUNT FOR DRIP..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 font-[1000] uppercase italic text-xl outline-none placeholder:text-gray-200"
          />
          {searchTerm && <X onClick={() => setSearchTerm("")} className="mr-4 cursor-pointer hover:text-jungli-orange" />}
        </div>
      </div>

      {/* 2. Category Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => onFilterChange(cat)}
            className="bg-white border-4 border-black px-6 py-2 font-black uppercase italic shadow-brutal-sm hover:bg-yellow-400 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}