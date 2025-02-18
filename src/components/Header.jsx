import { MagnifyingGlassIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import { useState } from 'react';

const Header = ({ onSearch, onSort = () => {} }) => {
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest first

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const handleSortClick = () => {
    // Toggle between ascending (old to new) and descending (new to old)
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    // This will work with your existing fetchNotes function that accepts sort parameter
    onSort(newOrder === 'desc' ? '-date' : 'date');
  };

  return (
    <header className="h-16 border-b flex items-center px-4 justify-between">
      <div className="flex w-full items-center relative me-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3" />
        <input
          type="text"
          placeholder="Search"
          onChange={handleSearchChange}
          className="w-full px-10 py-2 rounded-3xl bg-gray-100 focus:outline-none shadow-sm"
        />
      </div>
      <button 
        onClick={handleSortClick}
        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-3xl hover:text-gray-900 flex items-center gap-2 shadow-sm"
      >
        <ArrowsUpDownIcon className="h-5 w-5" />
        {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
      </button>
    </header>
  );
};

export default Header;
