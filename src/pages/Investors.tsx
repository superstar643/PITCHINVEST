import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import InvestorCard from '@/components/landing/InvestorCard';
import FilterBar from '@/components/FilterBar';
import { getSortedCountries } from '@/lib/countries';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const ITEMS_PER_PAGE = 12;

interface InvestorData {
  id: string;
  name: string;
  startup: string;
  avatar?: string;
  companyLogo?: string;
  companyName?: string;
  city?: string;
  country?: string;
  countryFlag?: string;
  partners?: string[];
  coverImage?: string;
  category?: string;
  stage?: string;
  role?: string;
}

const Investors: React.FC = () => {
  const { toast } = useToast();
  const [investors, setInvestors] = useState<InvestorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [countryValue, setCountryValue] = useState('all');
  const [categoryValue, setCategoryValue] = useState('all');
  const [stageValue, setStageValue] = useState('all');
  const [cityValue, setCityValue] = useState('all');
  const [roleValue, setRoleValue] = useState('all');

  // Fetch investors from Supabase
  useEffect(() => {
    const loadInvestors = async () => {
      try {
        setLoading(true);
        
        // Fetch users with user_type = 'Investor' - explicitly request all rows
        let users = null;
        let count = null;
        let usersError = null;

        // First try exact match (most common case)
        const { data: usersExact, error: errorExact, count: countExact } = await supabase
          .from('users')
          .select('id, full_name, personal_email, photo_url, cover_image_url, country, city, user_type, created_at', { count: 'exact' })
          .eq('user_type', 'Investor')
          .order('created_at', { ascending: false });

        if (errorExact) {
          console.error('Error fetching investors with exact match:', errorExact);
          usersError = errorExact;
        } else {
          users = usersExact;
          count = countExact;
        }

        // If no results with exact match or there was an error, try case-insensitive match as fallback
        if ((!users || users.length === 0) || errorExact) {
          console.log('🔄 No investors found with exact match or error occurred, trying case-insensitive match...');
          const { data: usersIlike, error: errorIlike, count: countIlike } = await supabase
            .from('users')
            .select('id, full_name, personal_email, photo_url, cover_image_url, country, city, user_type, created_at', { count: 'exact' })
            .ilike('user_type', 'Investor')
            .order('created_at', { ascending: false });
          
          if (errorIlike) {
            console.error('Error fetching investors with case-insensitive match:', errorIlike);
            if (!usersError) {
              usersError = errorIlike;
            }
          } else if (usersIlike && usersIlike.length > 0) {
            users = usersIlike;
            count = countIlike;
            usersError = null; // Clear error if second query succeeded
            console.log('✅ Found investors with case-insensitive match:', users.length);
          }
        }

        // If we still have an error and no users, show error and return
        if (usersError && (!users || users.length === 0)) {
          console.error('Error fetching investors after all attempts:', usersError);
          toast({
            title: 'Error',
            description: 'Failed to load investors',
            variant: 'destructive',
          });
          return;
        }

        console.log('📊 Total investors count from database:', count || 0);
        console.log('📊 Fetched investors from database:', users?.length || 0, 'investors');
        
        // Check if there's a mismatch between count and fetched rows
        if (count && count > (users?.length || 0)) {
          console.warn(`⚠️ Mismatch: Database has ${count} investors but only ${users?.length || 0} were fetched. This might be due to RLS policies or missing data.`);
        }

        if (!users || users.length === 0) {
          console.log('⚠️ No investors found in database');
          setInvestors([]);
          return;
        }

        // Log each investor for debugging
        users.forEach((user, index) => {
          console.log(`Investor ${index + 1}:`, {
            id: user.id,
            name: user.full_name,
            email: user.personal_email || 'N/A',
            country: user.country || 'N/A',
            city: user.city || 'N/A',
          });
        });

        // Fetch profiles for all investors (using LEFT JOIN approach with batch fetch)
        const userIds = users.map(u => u.id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, project_name, project_category, company_name, investment_preferences')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          // Don't return - continue without profiles
        }

        console.log('📊 Fetched profiles:', profiles?.length || 0, 'profiles');

        // Create profile map for quick lookup
        const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

        // Map users to investor data format - include ALL users regardless of profile
        const investorData: InvestorData[] = users.map(user => {
          const profile = profileMap.get(user.id);
          
          const investor: InvestorData = {
            id: user.id,
            name: user.full_name || 'Unknown Investor',
            startup: profile?.project_name || profile?.investment_preferences || 'Investment Portfolio',
            avatar: user.photo_url || undefined,
            companyLogo: user.photo_url || undefined,
            companyName: profile?.company_name || undefined,
            city: user.city || undefined,
            country: user.country || undefined,
            countryFlag: user.country || undefined,
            partners: [], // Partners not in database, using empty array
            coverImage: user.cover_image_url || undefined,
            category: profile?.project_category || undefined,
            stage: undefined, // Stage not in database for investors
            role: 'Investor', // All users here are investors
          };

          return investor;
        });

        console.log('✅ Mapped investors data:', investorData.length, 'investors');
        console.log('Investor IDs:', investorData.map(i => i.id));

        setInvestors(investorData);
      } catch (error) {
        console.error('Error loading investors:', error);
        toast({
          title: 'Error',
          description: 'Failed to load investors. Please refresh the page.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadInvestors();
  }, []);

  // Calculate real stats from investors
  const stats = useMemo(() => {
    const totalInvestors = investors.length;
    // These stats would need additional queries to calculate accurately
    // For now, using placeholder calculations
    return [
      { value: `${totalInvestors}+`, label: 'INVESTORS' },
      { value: '$2.5B+', label: 'TOTAL INVESTED' },
      { value: '500+', label: 'ACTIVE DEALS' },
      { value: '95%', label: 'SUCCESS RATE' },
    ];
  }, [investors]);

  // Use comprehensive countries list from countries.ts (all countries worldwide)
  const allCountries = useMemo(() => {
    return getSortedCountries().map(country => country.name);
  }, []);

  // Extract unique categories from investors
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    investors.forEach(investor => {
      if (investor.category) categorySet.add(investor.category);
    });
    return Array.from(categorySet).sort();
  }, [investors]);

  // Extract unique stages from investors (empty for now as stage is not in database)
  const stages = useMemo(() => {
    // Stage filter can be kept for future use but will be empty for now
    return [] as string[];
  }, []);

  // Extract unique cities from investors
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    investors.forEach(investor => {
      if (investor.city) citySet.add(investor.city);
    });
    return Array.from(citySet).sort();
  }, [investors]);

  // Extract unique roles from investors (all are "Investor")
  const roles = useMemo(() => {
    const roleSet = new Set<string>();
    investors.forEach(investor => {
      if (investor.role) roleSet.add(investor.role);
    });
    return Array.from(roleSet).sort();
  }, [investors]);

  // Filter investors based on all filters
  const filteredInvestors = useMemo(() => {
    return investors.filter(investor => {
      // Search filter
      const matchesSearch = searchValue === '' || 
        investor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        investor.city?.toLowerCase().includes(searchValue.toLowerCase()) ||
        investor.companyName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        investor.startup?.toLowerCase().includes(searchValue.toLowerCase());
      
      // Country filter
      const matchesCountry = countryValue === 'all' || investor.country === countryValue;
      
      // Category filter
      const matchesCategory = categoryValue === 'all' || investor.category === categoryValue;
      
      // Stage filter (always true for now as stage is not in database)
      const matchesStage = stageValue === 'all' || investor.stage === stageValue;
      
      // City filter
      const matchesCity = cityValue === 'all' || investor.city === cityValue;
      
      // Role filter
      const matchesRole = roleValue === 'all' || investor.role === roleValue;

      return matchesSearch && matchesCountry && matchesCategory && matchesStage && matchesCity && matchesRole;
    });
  }, [investors, searchValue, countryValue, categoryValue, stageValue, cityValue, roleValue]);

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
  }, [searchValue, countryValue, categoryValue, stageValue, cityValue, roleValue]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleReset = () => {
    setSearchValue('');
    setCountryValue('all');
    setCategoryValue('all');
    setStageValue('all');
    setCityValue('all');
    setRoleValue('all');
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
            <span className="text-[#0a3d5c]">Visionary Investors</span>
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
              <div className="text-2xl md:text-3xl font-bold text-[#0a3d5c] mb-1">
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
          categoryValue={categoryValue}
          onCategoryChange={setCategoryValue}
          stageValue={stageValue}
          onStageChange={setStageValue}
          cityValue={cityValue}
          onCityChange={setCityValue}
          roleValue={roleValue}
          onRoleChange={setRoleValue}
          onReset={handleReset}
          countries={allCountries}
          categories={categories}
          stages={stages}
          cities={cities}
          roles={roles}
          searchPlaceholder="Search investors, companies..."
        />

        {loading ? (
          <div className="py-12">
            <LoadingSpinner message="Loading investors..." />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {currentItems.map((investor) => (
                <InvestorCard
                  key={investor.id}
                  id={investor.id}
                  name={investor.name}
                  startup={investor.startup}
                  avatar={investor.avatar}
                  companyLogo={investor.companyLogo}
                  companyName={investor.companyName}
                  city={investor.city}
                  country={investor.country}
                  countryFlag={investor.countryFlag}
                  partners={investor.partners}
                  coverImage={investor.coverImage}
                />
              ))}
            </div>

            {currentItems.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                {investors.length === 0 
                  ? 'No investors available yet. Check back soon!'
                  : 'No results found. Try adjusting your filters.'}
              </div>
            )}
          </>
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
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#0a3d5c] text-white hover:bg-[#c5a665] shadow-md'
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
