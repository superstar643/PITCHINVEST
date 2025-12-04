import React, { useState, useMemo, useEffect } from 'react';
import UserCard from './UserCard';
import users from '@/lib/usersData';
import FilterBar from '@/components/FilterBar';

const ITEMS_PER_PAGE = 12;

const UsersSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [countryValue, setCountryValue] = useState('all');

  // Extract unique countries from users
  const countries = useMemo(() => {
    const countrySet = new Set<string>();
    users.forEach(user => {
      if (user.country) countrySet.add(user.country);
    });
    return Array.from(countrySet).sort();
  }, []);

  // Filter users based on search and country
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = searchValue === '' || 
        user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.startup?.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.companyName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchValue.toLowerCase());

      // Country filter
      const matchesCountry = countryValue === 'all' || user.country === countryValue;

      return matchesSearch && matchesCountry;
    });
  }, [searchValue, countryValue]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  
  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, countryValue]);

  const handleReset = () => {
    setSearchValue('');
    setCountryValue('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to section top
      document.getElementById('users-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <section id="users-section" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-bold text-center text-gray-900 mb-4">
          Investment Opportunities
        </h2>
        <p className="text-xl text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover innovative startups and invest in the future
        </p>

        <FilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          countryValue={countryValue}
          onCountryChange={setCountryValue}
          onReset={handleReset}
          countries={countries}
          searchPlaceholder="Search startups, founders..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {currentItems.map((user) => (
            <UserCard key={user.id} id={user.id} {...user} />
          ))}
        </div>

        {currentItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No results found. Try adjusting your filters.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-6 py-2.5 rounded-full border-2 font-semibold text-sm transition-all duration-200 ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-[#d5b775] text-[#d5b775] hover:bg-[#d5b775]/10'
              }`}
            >
              PREVIOUS
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                  className={`w-10 h-10 rounded-full font-semibold text-sm transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-[#d5b775] text-white shadow-md'
                      : page === '...'
                      ? 'text-gray-400 cursor-default'
                      : 'bg-gray-100 text-gray-600 hover:bg-[#d5b775]/20 hover:text-[#d5b775]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#d5b775] text-white hover:bg-[#c5a665] shadow-md'
              }`}
            >
              NEXT
            </button>
          </div>
        )}

        {/* Page info */}
        {filteredUsers.length > 0 && (
          <div className="text-center mt-4 text-sm text-gray-500">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} opportunities
          </div>
        )}
      </div>
    </section>
  );
};

export default UsersSection;
