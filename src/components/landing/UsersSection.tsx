import React, { useEffect, useRef, useState, useMemo } from 'react';
import UserCard from './UserCard';
import users from '@/lib/usersData';
import FilterBar from '@/components/FilterBar';

const localUsers = [
  { name: 'Miguel Silva', startup: 'Nentra Tech', city: 'Lisboa', country: 'Portugal', countryFlag: '🇵🇹', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421916644_96144368.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424834991_a690aee4.webp', companyName: 'Navis Aerium', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424851075_d773cb46.webp', investmentPercent: 15, investmentAmount: '1.800000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424867973_3355cabf.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424884496_255165e9.webp', approvalRate: 94.50, likes: 890, views: 2200 },
  { name: 'Sofia Martinez', startup: 'TechFlow', city: 'Madrid', country: 'Spain', countryFlag: '🇪🇸', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421918534_e38edc79.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424836961_f41e9579.webp', companyName: 'InnovateTech', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424853561_8cb6dd1c.webp', investmentPercent: 12, investmentAmount: '2.500000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424869863_f4ef3afe.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424886421_a31c3493.webp', approvalRate: 92.30, likes: 1250, views: 3100 },
  { name: 'Lucas Dubois', startup: 'SmartLogix', city: 'Paris', country: 'France', countryFlag: '🇫🇷', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421920458_0136a615.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424838824_d09fac3c.webp', companyName: 'LogiCore', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424855396_4b707321.webp', investmentPercent: 18, investmentAmount: '1.200000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424871833_3ba81df8.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424888344_ca9df494.webp', approvalRate: 89.75, likes: 670, views: 1890 },
  { name: 'Emma Schmidt', startup: 'DataVision', city: 'Berlin', country: 'Germany', countryFlag: '🇩🇪', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421922322_3dcfc0af.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424840682_6dc47da0.webp', companyName: 'VisionAI', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424857363_3c179bbf.webp', investmentPercent: 20, investmentAmount: '3.000000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424873780_09804217.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424890234_a0db4107.webp', approvalRate: 96.20, likes: 1540, views: 4200 },
  { name: 'Alessandro Rossi', startup: 'NexGen', city: 'Rome', country: 'Italy', countryFlag: '🇮🇹', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421924213_f44cbbce.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424842539_cef494bc.webp', companyName: 'GenTech', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424859320_078c1e15.webp', investmentPercent: 10, investmentAmount: '1.500000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424875670_34d29b62.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424892143_226da278.webp', approvalRate: 91.40, likes: 920, views: 2650 },
  { name: 'Nina Kowalski', startup: 'CloudSync', city: 'Warsaw', country: 'Poland', countryFlag: '🇵🇱', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421926117_d76866f7.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424844432_14e73978.webp', companyName: 'SyncPro', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424861208_54cd7382.webp', investmentPercent: 14, investmentAmount: '2.200000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424877564_1c4de7e1.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424894040_22858759.webp', approvalRate: 88.90, likes: 780, views: 2100 },
  { name: 'Johan Andersson', startup: 'EcoTech', city: 'Stockholm', country: 'Sweden', countryFlag: '🇸🇪', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421928133_ed35743b.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424846291_7cad13d6.webp', companyName: 'GreenWave', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424863210_1b577238.webp', investmentPercent: 16, investmentAmount: '1.900000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424879610_fe654cb4.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424895967_0c1546e3.webp', approvalRate: 93.80, likes: 1120, views: 2980 },
  { name: 'Maria Santos', startup: 'FinFlow', city: 'Amsterdam', country: 'Netherlands', countryFlag: '🇳🇱', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421930037_dc95e070.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424848188_611252fc.webp', companyName: 'FlowTech', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424865198_8e783441.webp', investmentPercent: 13, investmentAmount: '2.800000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424881520_4b201ef2.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424898094_ef46f607.webp', approvalRate: 95.10, likes: 1380, views: 3450 },
  { name: 'Carlos Mendes', startup: 'MobiTech', city: 'Porto', country: 'Portugal', countryFlag: '🇵🇹', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421931899_22632b5a.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424850082_fdc48b16.webp', companyName: 'MobiCore', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424867071_eca40ee1.webp', investmentPercent: 11, investmentAmount: '2.100000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424883513_fefbe4f1.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424900031_fe90d384.webp', approvalRate: 90.60, likes: 1050, views: 2750 },
  { name: 'Miguel Silva', startup: 'Nentra Tech', city: 'Lisboa', country: 'Portugal', countryFlag: '🇵🇹', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421916644_96144368.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424834991_a690aee4.webp', companyName: 'Navis Aerium', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424851075_d773cb46.webp', investmentPercent: 15, investmentAmount: '1.800000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424867973_3355cabf.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424884496_255165e9.webp', approvalRate: 94.50, likes: 890, views: 2200 },
  { name: 'Sofia Martinez', startup: 'TechFlow', city: 'Madrid', country: 'Spain', countryFlag: '🇪🇸', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421918534_e38edc79.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424836961_f41e9579.webp', companyName: 'InnovateTech', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424853561_8cb6dd1c.webp', investmentPercent: 12, investmentAmount: '2.500000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424869863_f4ef3afe.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424886421_a31c3493.webp', approvalRate: 92.30, likes: 1250, views: 3100 },
  { name: 'Lucas Dubois', startup: 'SmartLogix', city: 'Paris', country: 'France', countryFlag: '🇫🇷', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421920458_0136a615.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424838824_d09fac3c.webp', companyName: 'LogiCore', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424855396_4b707321.webp', investmentPercent: 18, investmentAmount: '1.200000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424871833_3ba81df8.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424888344_ca9df494.webp', approvalRate: 89.75, likes: 670, views: 1890 },
  { name: 'Emma Schmidt', startup: 'DataVision', city: 'Berlin', country: 'Germany', countryFlag: '🇩🇪', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421922322_3dcfc0af.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424840682_6dc47da0.webp', companyName: 'VisionAI', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424857363_3c179bbf.webp', investmentPercent: 20, investmentAmount: '3.000000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424873780_09804217.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424890234_a0db4107.webp', approvalRate: 96.20, likes: 1540, views: 4200 },
  { name: 'Alessandro Rossi', startup: 'NexGen', city: 'Rome', country: 'Italy', countryFlag: '🇮🇹', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421924213_f44cbbce.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424842539_cef494bc.webp', companyName: 'GenTech', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424859320_078c1e15.webp', investmentPercent: 10, investmentAmount: '1.500000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424875670_34d29b62.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424892143_226da278.webp', approvalRate: 91.40, likes: 920, views: 2650 },
  { name: 'Nina Kowalski', startup: 'CloudSync', city: 'Warsaw', country: 'Poland', countryFlag: '🇵🇱', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421926117_d76866f7.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424844432_14e73978.webp', companyName: 'SyncPro', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424861208_54cd7382.webp', investmentPercent: 14, investmentAmount: '2.200000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424877564_1c4de7e1.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424894040_22858759.webp', approvalRate: 88.90, likes: 780, views: 2100 },
  { name: 'Johan Andersson', startup: 'EcoTech', city: 'Stockholm', country: 'Sweden', countryFlag: '🇸🇪', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421928133_ed35743b.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424846291_7cad13d6.webp', companyName: 'GreenWave', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424863210_1b577238.webp', investmentPercent: 16, investmentAmount: '1.900000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424879610_fe654cb4.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424895967_0c1546e3.webp', approvalRate: 93.80, likes: 1120, views: 2980 },
  { name: 'Maria Santos', startup: 'FinFlow', city: 'Amsterdam', country: 'Netherlands', countryFlag: '🇳🇱', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421930037_dc95e070.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424848188_611252fc.webp', companyName: 'FlowTech', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424865198_8e783441.webp', investmentPercent: 13, investmentAmount: '2.800000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424881520_4b201ef2.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424898094_ef46f607.webp', approvalRate: 95.10, likes: 1380, views: 3450 },
  { name: 'Carlos Mendes', startup: 'MobiTech', city: 'Porto', country: 'Portugal', countryFlag: '🇵🇹', avatar: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763421931899_22632b5a.webp', companyLogo: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424850082_fdc48b16.webp', companyName: 'MobiCore', headerBg: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424867071_eca40ee1.webp', investmentPercent: 11, investmentAmount: '2.100000€', commission: 0, productImage1: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424883513_fefbe4f1.webp', productImage2: 'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424900031_fe90d384.webp', approvalRate: 90.60, likes: 1050, views: 2750 }
];

const BATCH_SIZE = 4;

const UsersSection: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState('');
  const [countryValue, setCountryValue] = useState('all');
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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

  // Reset visible count if filters change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchValue, countryValue]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // load next batch
            setIsLoading(true);
            // small timeout to allow for visual loading indicator (optional)
            setTimeout(() => {
              setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredUsers.length));
              setIsLoading(false);
            }, 300);
          }
        });
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [filteredUsers.length]);

  const visibleUsers = filteredUsers.slice(0, visibleCount);

  const handleReset = () => {
    setSearchValue('');
    setCountryValue('all');
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
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {visibleUsers.map((user) => (
            <UserCard key={user.id} id={user.id} {...user} />
          ))}
        </div>

        {visibleUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No results found. Try adjusting your filters.
          </div>
        )}

        {/* Sentinel / loader area */}
        <div ref={sentinelRef} className="mt-8 flex justify-center items-center">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span className="text-sm text-gray-600">Loading more...</span>
            </div>
          ) : visibleCount < filteredUsers.length ? (
            <button
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredUsers.length))}
            >
              Load more
            </button>
          ) : filteredUsers.length > 0 ? (
            <div className="text-sm text-gray-400">No more users</div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default UsersSection;
