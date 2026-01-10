import React, { useState, useMemo, useEffect } from 'react';
import UserCard from './UserCard';
import FilterBar from '@/components/FilterBar';
import { getSortedCountries, countries } from '@/lib/countries';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const ITEMS_PER_PAGE = 12;

interface UserData {
  id: string;
  fullName: string;
  projectName: string;
  city: string;
  country: string;
  countryFlag: string;
  photo: string;
  companyLogo: string;
  companyName: string;
  coverImage: string;
  capitalPercentage: number;
  capitalTotalValue: string;
  commission: number;
  photos: string[];
  description?: string;
  approvalRate: number;
  likes: number;
  views: number;
  availableStatus: boolean;
  projectCategory?: string;
}

const UsersSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [countryValue, setCountryValue] = useState('all');
  const [categoryValue, setCategoryValue] = useState('all');
  const [cityValue, setCityValue] = useState('all');
  const [investmentRangeValue, setInvestmentRangeValue] = useState('all');
  const [equityRangeValue, setEquityRangeValue] = useState('all');
  const [availabilityValue, setAvailabilityValue] = useState('all');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        
        // First, get all users with user_type in ['Inventor', 'StartUp', 'Company'] and approved status
        // Try multiple variations of user_type to handle case differences
        let usersData = null;
        let usersError = null;
        
        // Try exact match first (most common case)
        // Note: We only want users with approved profile_status
        const { data: usersExact, error: errorExact, count: countExact } = await supabase
          .from('users')
          .select('id, full_name, photo_url, cover_image_url, country, city, user_type, profile_status, created_at', { count: 'exact' })
          .in('user_type', ['Inventor', 'StartUp', 'Company'])
          .eq('profile_status', 'approved')
          .order('created_at', { ascending: false });

        if (errorExact) {
          console.error('❌ Error fetching users with exact match:', errorExact);
          usersError = errorExact;
        } else {
          usersData = usersExact;
        }

        // If no results or error, try alternative spellings (Startup vs StartUp)
        if ((!usersData || usersData.length === 0) || errorExact) {
         
          const { data: usersAlt, error: errorAlt, count: countAlt } = await supabase
            .from('users')
            .select('id, full_name, photo_url, cover_image_url, country, city, user_type, profile_status, created_at', { count: 'exact' })
            .in('user_type', ['Inventor', 'Startup', 'Company'])
            .eq('profile_status', 'approved')
            .order('created_at', { ascending: false });

          if (!errorAlt && usersAlt && usersAlt.length > 0) {
            usersData = usersAlt;
            usersError = null;
         
          } else if (errorAlt && !usersError) {
            usersError = errorAlt;
          }
        }
        
        // Also check how many non-investor users exist regardless of profile_status (for debugging)
        if ((!usersData || usersData.length === 0)) {
        
          const { data: allUsers, count: allCount } = await supabase
            .from('users')
            .select('id, user_type, profile_status', { count: 'exact' })
            .in('user_type', ['Inventor', 'StartUp', 'Startup', 'Company']);
          
          if (allUsers && allUsers.length > 0) {
            
            const statusBreakdown = allUsers.reduce((acc, u) => {
              const status = u.profile_status || 'null';
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
        
          }
        }


        if (usersError && (!usersData || usersData.length === 0)) {

          setUsers([]);
          setLoading(false);
          return;
        }

        if (!usersData || usersData.length === 0) {
        
          setUsers([]);
          setLoading(false);
          return;
        }

        // Get user IDs for subscription check
        const allUserIds = usersData.map(u => u.id);


        // Fetch active subscriptions for these users
        // Supabase .in() has a limit of ~100 items, so we need to batch if needed
        const now = new Date().toISOString();
        let subscriptions: any[] = [];
        const BATCH_SIZE = 100;

        if (allUserIds.length === 0) {
         
        } else {
          // First, let's check what subscriptions exist (without date filter to see all)
          const { data: allSubs, error: allSubsError } = await supabase
            .from('subscriptions')
            .select('user_id, status, current_period_start, current_period_end, created_at')
            .in('user_id', allUserIds);
          
       
       
          // Batch the subscription query if we have more than 100 users
          for (let i = 0; i < allUserIds.length; i += BATCH_SIZE) {
            const batch = allUserIds.slice(i, i + BATCH_SIZE);
            const { data: batchSubs, error: subsError } = await supabase
              .from('subscriptions')
              .select('user_id, status, current_period_end')
              .in('user_id', batch)
              .eq('status', 'active')
              .gt('current_period_end', now);

            if (subsError) {
              console.error(`❌ Error fetching active subscriptions for batch ${i / BATCH_SIZE + 1}:`, subsError);
              // If subscription table doesn't exist or query fails, show all approved users
              if (subsError.code === '42P01' || subsError.message?.includes('does not exist')) {
               
                break;
              }
            } else if (batchSubs) {
              subscriptions = [...subscriptions, ...batchSubs];
            
            }
          }
        }



        // Filter users to only include those with active subscriptions
        const subscribedUserIds = new Set((subscriptions || []).map(s => s.user_id));
        const subscribedUsers = usersData.filter(user => subscribedUserIds.has(user.id));



        // Determine final users to display
        // Strategy: Always show all approved users to ensure visibility
        // If subscriptions are required in production, enforce that separately
        let finalUsers: typeof usersData = usersData;
        
        // Ensure we're not accidentally filtering out users
        // Always show all approved users regardless of subscription status
        // This ensures users are visible even if subscription system isn't fully set up
        // TODO: In production, you may want to strictly enforce subscription requirement
        

        
        // Ensure we have at least some users
        if (!finalUsers || finalUsers.length === 0) {

          setUsers([]);
          setLoading(false);
          return;
        }

        // Fetch related data in batches
        const userIds = finalUsers.map(u => u.id);
        
        // Fetch profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, project_name, project_category, company_name, inventor_name')
          .in('user_id', userIds);

        // Fetch commercial proposals
        const { data: proposals } = await supabase
          .from('commercial_proposals')
          .select('user_id, equity_capital_percentage, equity_total_value')
          .in('user_id', userIds);

        // Fetch pitch materials for photos
        const { data: materials } = await supabase
          .from('pitch_materials')
          .select('user_id, photos_urls, description')
          .in('user_id', userIds);

        // Fetch projects for likes/views
        const { data: projects } = await supabase
          .from('projects')
          .select('user_id, likes, views, available_status')
          .in('user_id', userIds)
          .eq('status', 'approved');


        // Create maps for quick lookup
        const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
        const proposalMap = new Map((proposals || []).map(p => [p.user_id, p]));
        const materialMap = new Map((materials || []).map(m => [m.user_id, m]));
        const projectMap = new Map((projects || []).map(p => [p.user_id, p]));

        // Helper to get country flag emoji
        const getCountryFlag = (countryName: string | null): string => {
          if (!countryName) return '🌍';
          const country = countries.find(c => c.name === countryName);
          return country?.flag || '🌍';
        };

        // Map database data to UserCard format
        const mappedUsers: UserData[] = finalUsers.map(user => {
          const profile = profileMap.get(user.id);
          const proposal = proposalMap.get(user.id);
          const material = materialMap.get(user.id);
          const project = projectMap.get(user.id);

          // Determine project name
          const projectName = profile?.project_name || 
                             profile?.company_name || 
                             profile?.inventor_name || 
                             'Project';

          // Determine company name
          const companyName = profile?.company_name || 
                            profile?.project_name || 
                            user.full_name;

          // Get investment data
          const equityPercentage = proposal?.equity_capital_percentage 
            ? parseFloat(proposal.equity_capital_percentage) 
            : 15;
          
          // Format equity value to match expected format (e.g., "1.800000€")
          const formatEquityValue = (value: string | null): string => {
            if (!value) return '1.800000€';
            const numValue = parseFloat(value);
            if (isNaN(numValue)) return '1.800000€';
            // Format as "X.XXXXXX€" (e.g., 1800000 -> "1.800000€")
            const millions = numValue / 1000000;
            return `${millions.toFixed(6)}€`;
          };
          
          const equityValue = formatEquityValue(proposal?.equity_total_value);

          // Get photos
          const photos = material?.photos_urls && Array.isArray(material.photos_urls) && material.photos_urls.length > 0
            ? material.photos_urls.slice(0, 2)
            : ['/placeholder.svg', '/placeholder.svg'];

          // Get likes and views from project
          const likes = project?.likes || 0;
          const views = project?.views || 0;
          const availableStatus = project?.available_status ?? true;

          // Calculate approval rate (mock for now, can be calculated from actual data)
          const approvalRate = Math.floor(Math.random() * 20) + 80; // 80-100%

          return {
            id: user.id,
            fullName: user.full_name,
            projectName,
            city: user.city || 'Unknown',
            country: user.country || 'Unknown',
            countryFlag: getCountryFlag(user.country),
            photo: user.photo_url || '/placeholder.svg',
            companyLogo: user.photo_url || '/placeholder.svg',
            companyName,
            coverImage: user.cover_image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop',
            capitalPercentage: equityPercentage,
            capitalTotalValue: equityValue,
            commission: 0,
            photos,
            description: material?.description || 'Innovative project seeking investment',
            approvalRate,
            likes,
            views,
            availableStatus,
            projectCategory: profile?.project_category || undefined,
          };
        });


        
        
        setUsers(mappedUsers);
      } catch (error) {

        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);
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
  }, [users]);

  // Extract unique cities from users
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    users.forEach(user => {
      if (user.city) citySet.add(user.city);
    });
    return Array.from(citySet).sort();
  }, [users]);

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
  }, [users, searchValue, countryValue, categoryValue, cityValue, investmentRangeValue, equityRangeValue, availabilityValue]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  
  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const items = filteredUsers.slice(startIndex, endIndex);
    
    return items;
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

  if (loading) {
    return (
      <section id="users-section" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-4">
            Investment Opportunities
          </h2>
          <p className="text-xl text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover innovative startups and invest in the future
          </p>
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner message="Loading investment opportunities..." />
          </div>
        </div>
      </section>
    );
  }

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
