import React, { useEffect, useState } from 'react';
import investers from '@/lib/investersData';
import InvestorCard from '@/components/landing/InvestorCard';

const INITIAL_COUNT = 8;
const INCREMENT = 8;

const Investors: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_COUNT);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => {
      if (isLoading) return;
      if (visibleCount >= investers.length) return;

      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300;

      if (nearBottom) {
        setIsLoading(true);
        // small debounce to avoid rapid repeated loads
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + INCREMENT, investers.length));
          setIsLoading(false);
        }, 500);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLoading, visibleCount]);

  const visibleList = investers.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-white pt-24 flex justify-center pb-12">
      <div className="w-full max-w-7xl px-4">
        <h1 className="text-4xl font-bold text-[#0a3d5c] mb-6 text-center">Investors</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

        <div className="mt-8 text-center">
          {isLoading && <div className="text-sm text-gray-500">Loading more...</div>}
          {!isLoading && visibleCount >= investers.length && (
            <div className="text-sm text-gray-400">You have reached the end.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Investors;
