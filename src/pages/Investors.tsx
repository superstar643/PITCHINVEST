import React, { useState, useMemo, useEffect } from 'react';
import investers from '@/lib/investersData';
import InvestorCard from '@/components/landing/InvestorCard';
import FilterBar from '@/components/FilterBar';

const ITEMS_PER_PAGE = 12;

const Investors: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [countryValue, setCountryValue] = useState('all');

  // Stats for the hero section
  const stats = [
    { value: '1,200+', label: 'INVESTORS' },
    { value: '$2.5B+', label: 'TOTAL INVESTED' },
    { value: '500+', label: 'ACTIVE DEALS' },
    { value: '95%', label: 'SUCCESS RATE' },
  ];

  // Extract unique countries from investors
  const countries = useMemo(() => {
    const countrySet = new Set<string>();
    investers.forEach(investor => {
      if (investor.country) countrySet.add(investor.country);
    });
    return Array.from(countrySet).sort();
  }, []);

  // Filter investors based on search and country
  const filteredInvestors = useMemo(() => {
    return investers.filter(investor => {
      // Search filter
      const matchesSearch = searchValue === '' || 
        investor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        investor.companyName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        investor.startup?.toLowerCase().includes(searchValue.toLowerCase()) ||
        investor.city?.toLowerCase().includes(searchValue.toLowerCase());

      // Country filter
      const matchesCountry = countryValue === 'all' || investor.country === countryValue;

      return matchesSearch && matchesCountry;
    });
  }, [searchValue, countryValue]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredInvestors.length / ITEMS_PER_PAGE);
  
  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredInvestors.slice(startIndex, endIndex);
  }, [filteredInvestors, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, countryValue]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleReset = () => {
    setSearchValue('');
    setCountryValue('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      // Show all pages if 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page and neighbors
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
    <div className="min-h-screen bg-white pt-24 flex flex-col items-center pb-12">
      {/* Hero Stats Section */}
      <div className="w-full bg-gradient-to-b from-gray-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-[#0a3d5c]">Connect with </span>
            <span className="text-[#d5b775]">Visionary Investors</span>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Discover verified investors across industries, countries, and investment ranges. Build partnerships that bring groundbreaking innovations to life.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl py-6 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-2xl md:text-3xl font-bold text-[#d5b775] mb-1">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm font-semibold text-gray-500 tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-8xl 2xl:px-40 lg:px-28 px-4">
        <FilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          countryValue={countryValue}
          onCountryChange={setCountryValue}
          onReset={handleReset}
          countries={countries}
          searchPlaceholder="Search investors, companies..."
        />

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {currentItems.map((u: any) => (
            <InvestorCard
              key={u.id}
              id={u.id}
              name={u.name}
              startup={u.startup}
              avatar={u.avatar}
              companyLogo={u.companyLogo}
              companyName={u.companyName}
              city={u.city}
              country={u.country}
              countryFlag={u.countryFlag}
              partners={u.partners}
              coverImage={u.coverImage}
            />
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
        {filteredInvestors.length > 0 && (
          <div className="text-center mt-4 text-sm text-gray-500">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvestors.length)} of {filteredInvestors.length} investors
          </div>
        )}
      </div>
    </div>
  );
};

export default Investors;
