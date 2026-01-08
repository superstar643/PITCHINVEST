import React, { useState, useMemo, useEffect } from 'react';
import UserCard from './UserCard';
import users from '@/lib/usersData';
import FilterBar from '@/components/FilterBar';
import { getSortedCountries } from '@/lib/countries';

const ITEMS_PER_PAGE = 12;

const UsersSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [countryValue, setCountryValue] = useState('all');
  const [categoryValue, setCategoryValue] = useState('all');
  const [cityValue, setCityValue] = useState('all');
  const [investmentRangeValue, setInvestmentRangeValue] = useState('all');
  const [equityRangeValue, setEquityRangeValue] = useState('all');
  const [availabilityValue, setAvailabilityValue] = useState('all');

  // Use comprehensive countries list from countries.ts (all countries worldwide)
  const allCountries = useMemo(() => {
    return getSortedCountries().map(country => country.name);
  }, []);

  // Extract unique categories from users
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    users.forEach(user => {
      if (user.projectCategory) categorySet.add(user.projectCategory);
    });
    return Array.from(categorySet).sort();
  }, []);

  // Extract unique cities from users
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    users.forEach(user => {
      if (user.city) citySet.add(user.city);
    });
    return Array.from(citySet).sort();
  }, []);

  // Helper function to parse investment amount from string like '1.800000€'
  const parseInvestmentAmount = (value: string): number => {
    const cleaned = value.replace(/[€,.]/g, '');
    const numStr = cleaned.replace(/(\d{1})(\d{6})$/, '$1.$2'); // Convert '1800000' to '1.800000'
    return parseFloat(numStr) || 0;
  };

  // Filter users based on all filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = searchValue === '' || 
        user.fullName.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.projectName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.companyName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchValue.toLowerCase());

      // Country filter
      const matchesCountry = countryValue === 'all' || user.country === countryValue;
      
      // Category filter
      const matchesCategory = categoryValue === 'all' || user.projectCategory === categoryValue;
      
      // City filter
      const matchesCity = cityValue === 'all' || user.city === cityValue;

      // Investment Amount Range filter
      let matchesInvestmentRange = true;
      if (investmentRangeValue !== 'all') {
        const investmentAmount = parseInvestmentAmount(user.capitalTotalValue);
        switch (investmentRangeValue) {
          case 'Under €1.5M':
            matchesInvestmentRange = investmentAmount < 1.5;
            break;
          case '€1.5M - €2M':
            matchesInvestmentRange = investmentAmount >= 1.5 && investmentAmount < 2.0;
            break;
          case '€2M - €2.5M':
            matchesInvestmentRange = investmentAmount >= 2.0 && investmentAmount < 2.5;
            break;
          case '€2.5M - €3M':
            matchesInvestmentRange = investmentAmount >= 2.5 && investmentAmount < 3.0;
            break;
          case 'Over €3M':
            matchesInvestmentRange = investmentAmount >= 3.0;
            break;
        }
      }

      // Equity Percentage Range filter
      let matchesEquityRange = true;
      if (equityRangeValue !== 'all') {
        switch (equityRangeValue) {
          case 'Under 12%':
            matchesEquityRange = user.capitalPercentage < 12;
            break;
          case '12% - 15%':
            matchesEquityRange = user.capitalPercentage >= 12 && user.capitalPercentage < 15;
            break;
          case '15% - 18%':
            matchesEquityRange = user.capitalPercentage >= 15 && user.capitalPercentage < 18;
            break;
          case '18% - 20%':
            matchesEquityRange = user.capitalPercentage >= 18 && user.capitalPercentage < 20;
            break;
          case 'Over 20%':
            matchesEquityRange = user.capitalPercentage >= 20;
            break;
        }
      }

      // Availability Status filter
      const matchesAvailability = availabilityValue === 'all' || 
        (availabilityValue === 'Available' && user.availableStatus) ||
        (availabilityValue === 'Unavailable' && !user.availableStatus);

      return matchesSearch && matchesCountry && matchesCategory && matchesCity && 
             matchesInvestmentRange && matchesEquityRange && matchesAvailability;
    });
  }, [searchValue, countryValue, categoryValue, cityValue, investmentRangeValue, equityRangeValue, availabilityValue]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  
  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  // Investment ranges for filter
  const investmentRanges = [
    'Under €1.5M',
    '€1.5M - €2M',
    '€2M - €2.5M',
    '€2.5M - €3M',
    'Over €3M'
  ];

  // Equity percentage ranges for filter
  const equityRanges = [
    'Under 12%',
    '12% - 15%',
    '15% - 18%',
    '18% - 20%',
    'Over 20%'
  ];

  // Availability options
  const availabilities = ['Available', 'Unavailable'];

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, countryValue, categoryValue, cityValue, investmentRangeValue, equityRangeValue, availabilityValue]);

  const handleReset = () => {
    setSearchValue('');
    setCountryValue('all');
    setCategoryValue('all');
    setCityValue('all');
    setInvestmentRangeValue('all');
    setEquityRangeValue('all');
    setAvailabilityValue('all');
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
          categoryValue={categoryValue}
          onCategoryChange={setCategoryValue}
          cityValue={cityValue}
          onCityChange={setCityValue}
          investmentRangeValue={investmentRangeValue}
          onInvestmentRangeChange={setInvestmentRangeValue}
          equityRangeValue={equityRangeValue}
          onEquityRangeChange={setEquityRangeValue}
          availabilityValue={availabilityValue}
          onAvailabilityChange={setAvailabilityValue}
          onReset={handleReset}
          countries={allCountries}
          categories={categories}
          cities={cities}
          investmentRanges={investmentRanges}
          equityRanges={equityRanges}
          availabilities={availabilities}
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
                  : 'border-[#0a3d5c] text-[#0a3d5c] hover:bg-[#0a3d5c]/10'
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
                      ? 'bg-[#0a3d5c] text-white shadow-md'
                      : page === '...'
                      ? 'text-gray-400 cursor-default'
                      : 'bg-gray-100 text-gray-600 hover:bg-[#0a3d5c]/20 hover:text-[#0a3d5c]'
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
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 border-2 ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#0a3d5c] text-white hover:bg-white hover:text-[#0a3d5c] hover:border-[#0a3d5c] shadow-md'
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
