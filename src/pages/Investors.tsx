import React, { useEffect, useState, useMemo } from 'react';
import investers from '@/lib/investersData';
import InvestorCard from '@/components/landing/InvestorCard';
import FilterBar from '@/components/FilterBar';

const INITIAL_COUNT = 6;
const INCREMENT = 6;

const Investors: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_COUNT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState('');
  const [countryValue, setCountryValue] = useState('all');

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

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [searchValue, countryValue]);

  useEffect(() => {
    const onScroll = () => {
      if (isLoading) return;
      if (visibleCount >= filteredInvestors.length) return;

      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300;

      if (nearBottom) {
        setIsLoading(true);
        // small debounce to avoid rapid repeated loads
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + INCREMENT, filteredInvestors.length));
          setIsLoading(false);
        }, 500);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLoading, visibleCount, filteredInvestors.length]);

  const visibleList = filteredInvestors.slice(0, visibleCount);

  const handleReset = () => {
    setSearchValue('');
    setCountryValue('all');
  };

  return (
    <div className="min-h-screen bg-white pt-24 flex justify-center pb-12">
      <div className="w-full max-w-8xl 2xl:px-40 lg:px-28">
        <h1 className="text-4xl font-bold text-[#0a3d5c] mb-6 text-center">Investors</h1>

        <FilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          countryValue={countryValue}
          onCountryChange={setCountryValue}
          onReset={handleReset}
          countries={countries}
        />

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {visibleList.map((u: any) => (
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

        {visibleList.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No results found. Try adjusting your filters.
          </div>
        )}

        <div className="mt-8 text-center">
          {isLoading && <div className="text-sm text-gray-500">Loading more...</div>}
          {!isLoading && visibleCount >= filteredInvestors.length && filteredInvestors.length > 0 && (
            <div className="text-sm text-gray-400">You have reached the end.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Investors;
