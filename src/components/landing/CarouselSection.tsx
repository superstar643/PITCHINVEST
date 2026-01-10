import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ThumbsUp, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { countries } from '@/lib/countries';

// Helper to get country flag emoji
const getCountryFlag = (countryName: string | null): string => {
  if (!countryName) return '🌍';
  const country = countries.find(c => c.name === countryName);
  return country?.flag || '🌍';
};

// Helper to truncate text with ellipsis (for cases where CSS line-clamp isn't suitable)
const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  // Try to truncate at word boundary to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  return truncated + '...';
};

interface LeftCardData {
  id: string;
  projectId?: string; // Add project ID for matching
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
  projectCategory?: string; // Add category for matching investors
}

interface RightCardData {
  id: string;
  avatar: string;
  coverImage?: string;
  company: string;
  name: string;
  location: string;
  title: string;
  description?: string;
  portfolio: Array<{ name: string; image: string }>;
}

interface CarouselData {
  left: LeftCardData;
  right: RightCardData;
  carouselImage: string;
}

export default function CarouselSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [leftCardMessageClick, setLeftCardMessageClick] = useState(false);
  const [carouselData, setCarouselData] = useState<CarouselData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch carousel data from Supabase
  useEffect(() => {
    const loadCarouselData = async () => {
      try {
        setLoading(true);

        // Fetch approved, subscribed non-investor users for left cards
        const { data: usersData } = await supabase
          .from('users')
          .select('id, full_name, photo_url, cover_image_url, country, city, user_type, profile_status')
          .in('user_type', ['Inventor', 'StartUp', 'Company'])
          .eq('profile_status', 'approved')
          .order('created_at', { ascending: false })
          .limit(10);

        // Check subscriptions (simplified - you may want to add subscription check like in UsersSection)
        const userIds = usersData?.map(u => u.id) || [];
        const now = new Date().toISOString();
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('user_id')
          .in('user_id', userIds)
          .eq('status', 'active')
          .gt('current_period_end', now);

        const subscribedUserIds = new Set((subscriptions || []).map(s => s.user_id));
        const subscribedUsers = usersData?.filter(user => subscribedUserIds.has(user.id)) || [];
        
        // Fallback to all approved users if no subscriptions found
        const finalUsers = subscribedUsers.length > 0 ? subscribedUsers : (usersData || []);

        // Fetch related data
        const finalUserIds = finalUsers.map(u => u.id);
        const [profilesRes, proposalsRes, materialsRes, projectsRes] = await Promise.all([
          supabase.from('profiles').select('user_id, project_name, project_category, company_name, inventor_name').in('user_id', finalUserIds),
          supabase.from('commercial_proposals').select('user_id, equity_capital_percentage, equity_total_value').in('user_id', finalUserIds),
          supabase.from('pitch_materials').select('user_id, photos_urls, description').in('user_id', finalUserIds),
          supabase.from('projects').select('id, user_id, likes, views, available_status, cover_image_url, image_urls, category').in('user_id', finalUserIds).eq('status', 'approved')
        ]);

        const profileMap = new Map((profilesRes.data || []).map(p => [p.user_id, p]));
        const proposalMap = new Map((proposalsRes.data || []).map(p => [p.user_id, p]));
        const materialMap = new Map((materialsRes.data || []).map(m => [m.user_id, m]));
        const projectMap = new Map((projectsRes.data || []).map(p => [p.user_id, p]));

        // Fetch investors for right cards
        const { data: investorsData } = await supabase
          .from('users')
          .select('id, full_name, photo_url, cover_image_url, country, city, user_type')
          .eq('user_type', 'Investor')
          .order('created_at', { ascending: false })
          .limit(10);

        const investorProfileMap = new Map();
        const investorMaterialsMap = new Map();
        if (investorsData && investorsData.length > 0) {
          const investorIds = investorsData.map(i => i.id);
          const [profilesRes, materialsRes] = await Promise.all([
            supabase
              .from('profiles')
              .select('user_id, company_name')
              .in('user_id', investorIds),
            supabase
              .from('pitch_materials')
              .select('user_id, description')
              .in('user_id', investorIds)
          ]);
          
          (profilesRes.data || []).forEach(p => investorProfileMap.set(p.user_id, p));
          (materialsRes.data || []).forEach(m => investorMaterialsMap.set(m.user_id, m));
        }

        // Format equity value
        const formatEquityValue = (value: string | null): string => {
          if (!value) return '1.800000€';
          const numValue = parseFloat(value);
          if (isNaN(numValue)) return '1.800000€';
          const millions = numValue / 1000000;
          return `${millions.toFixed(6)}€`;
        };

        // Map left cards with project information
        const leftCards: LeftCardData[] = finalUsers.slice(0, 5).map(user => {
          const profile = profileMap.get(user.id);
          const proposal = proposalMap.get(user.id);
          const material = materialMap.get(user.id);
          const project = projectMap.get(user.id);

          const projectName = profile?.project_name || profile?.company_name || profile?.inventor_name || 'Project';
          const companyName = profile?.company_name || profile?.project_name || user.full_name;
          const equityPercentage = proposal?.equity_capital_percentage ? parseFloat(proposal.equity_capital_percentage) : 15;
          const equityValue = formatEquityValue(proposal?.equity_total_value);
          const photos = material?.photos_urls && Array.isArray(material.photos_urls) && material.photos_urls.length > 0
            ? material.photos_urls.slice(0, 2)
            : (project?.image_urls && Array.isArray(project.image_urls) && project.image_urls.length > 0
              ? project.image_urls.slice(0, 2)
              : ['/placeholder.svg', '/placeholder.svg']);

          return {
            id: user.id,
            projectId: project?.id,
            fullName: user.full_name,
            projectName,
            city: user.city || 'Unknown',
            country: user.country || 'Unknown',
            countryFlag: getCountryFlag(user.country),
            photo: user.photo_url || '/placeholder.svg',
            companyLogo: user.photo_url || '/placeholder.svg',
            companyName,
            coverImage: user.cover_image_url || project?.cover_image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop',
            capitalPercentage: equityPercentage,
            capitalTotalValue: equityValue,
            commission: 0,
            photos,
            description: material?.description || 'Innovative project seeking investment',
            approvalRate: Math.floor(Math.random() * 20) + 80,
            likes: project?.likes || 0,
            views: project?.views || 0,
            availableStatus: project?.available_status ?? true,
            projectCategory: profile?.project_category || project?.category,
          };
        });

        // Map right cards (investors)
        const rightCards: RightCardData[] = (investorsData || []).slice(0, 5).map(investor => {
          const profile = investorProfileMap.get(investor.id);
          const material = investorMaterialsMap.get(investor.id);
          const companyName = profile?.company_name || investor.full_name || 'Investment Company';
          
          // Format location properly - handle null, undefined, and empty strings
          const formatLocation = (city: string | null | undefined, country: string | null | undefined): string => {
            // Ensure we're working with strings and handle null/undefined
            const cityStr = city ? String(city).trim() : '';
            const countryStr = country ? String(country).trim() : '';
            
            // Build location parts array
            const locationParts: string[] = [];
            if (cityStr) locationParts.push(cityStr);
            if (countryStr) locationParts.push(countryStr);
            
            if (locationParts.length > 0) {
              return locationParts.join(', ');
            }
            return 'Location not specified';
          };
          
          const location = formatLocation(investor.city, investor.country);
         
          return {
            id: investor.id,
            avatar: investor.photo_url || '/placeholder.svg',
            coverImage: investor.cover_image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop',
            company: companyName.toUpperCase(),
            name: investor.full_name || 'Investor',
            location,
            title: 'Investor',
            description: material?.description || 'Investment company focused on innovative technologies.',
            portfolio: [
              { name: 'Portfolio 1', image: '/placeholder.svg' },
              { name: 'Portfolio 2', image: '/placeholder.svg' },
              { name: 'Portfolio 3', image: '/placeholder.svg' },
              { name: 'Portfolio 4', image: '/placeholder.svg' },
              { name: 'Portfolio 5', image: '/placeholder.svg' },
              { name: 'Portfolio 6', image: '/placeholder.svg' },
            ],
          };
        });

        // Fetch gallery items linked to projects for proper matching
        // We'll match carousel images to left cards based on project_id
        const projectIds = leftCards.map(card => card.projectId).filter(Boolean) as string[];
        const galleryItemsMap = new Map<string, string>(); // project_id -> carousel_image_url
        
        if (projectIds.length > 0) {
          try {
            // First, verify which projects are approved
            const { data: approvedProjects } = await supabase
              .from('projects')
              .select('id, status')
              .in('id', projectIds)
              .eq('status', 'approved');
            
            const approvedProjectIds = new Set((approvedProjects || []).map(p => p.id));
            
            // Then fetch gallery items for approved projects only
            if (approvedProjectIds.size > 0) {
              const { data: galleryItems } = await supabase
                .from('gallery_items')
                .select('project_id, image_url, images')
                .in('project_id', Array.from(approvedProjectIds))
                .limit(10);

              if (galleryItems && galleryItems.length > 0) {
                galleryItems.forEach(item => {
                  if (item.project_id && approvedProjectIds.has(item.project_id)) {
                    // Prefer image_url, then first image from images array
                    const imageUrl = item.image_url || 
                      (item.images && Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null);
                    if (imageUrl && !galleryItemsMap.has(item.project_id)) {
                      galleryItemsMap.set(item.project_id, imageUrl);
                    }
                  }
                });
              }
            }
          } catch (error) {
            console.error('Error fetching gallery items for carousel:', error);
          }
        }

        // Fallback: Get featured gallery items if no project-specific images found
        if (galleryItemsMap.size === 0) {
          try {
            const { data: featuredGallery } = await supabase
              .from('gallery_items')
              .select('project_id, image_url, images')
              .eq('featured', true)
              .limit(10);

            featuredGallery?.forEach(item => {
              if (item.project_id && !galleryItemsMap.has(item.project_id)) {
                const imageUrl = item.image_url || 
                  (item.images && Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null);
                if (imageUrl) {
                  galleryItemsMap.set(item.project_id, imageUrl);
                }
              }
            });
          } catch (error) {
            console.error('Error fetching featured gallery items:', error);
          }
        }

        // Combine data - create proper relationships between left, center, and right cards
        const combined: CarouselData[] = [];
        const maxItems = Math.min(leftCards.length, rightCards.length, 5);
        
        for (let i = 0; i < maxItems; i++) {
          const leftCard = leftCards[i];
          const rightCard = rightCards[i];
          
          // Get carousel image for this project - match by project_id
          let carouselImage: string;
          if (leftCard.projectId && galleryItemsMap.has(leftCard.projectId)) {
            carouselImage = galleryItemsMap.get(leftCard.projectId)!;
          } else if (leftCard.coverImage && leftCard.coverImage !== '/placeholder.svg') {
            // Fallback to left card's cover image
            carouselImage = leftCard.coverImage;
          } else if (leftCard.photos && leftCard.photos.length > 0 && leftCard.photos[0] !== '/placeholder.svg') {
            // Fallback to first photo from left card
            carouselImage = leftCard.photos[0];
          } else {
            // Final fallback
            carouselImage = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop';
          }

          combined.push({
            left: leftCard,
            right: rightCard,
            carouselImage,
          });
        }

        setCarouselData(combined);
      } catch (error) {
        console.error('Error loading carousel data:', error);
        setCarouselData([]);
      } finally {
        setLoading(false);
      }
    };

    loadCarouselData();
  }, []);

  const handleLeftCardMessageClick = () => {
    if (carouselData.length === 0) return;
    const leftData = carouselData[currentIndex].left;
    if (leftData.availableStatus) {
      if (leftData.id) {
        navigate(`/messages/${leftData.id}`);
      } else {
        navigate('/messages');
      }
      return;
    }
    setLeftCardMessageClick(true);
    setTimeout(() => {
      setLeftCardMessageClick(false);
    }, 1500);
  };

  // Trigger animation when index changes
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const getVisibleImages = () => {
    if (carouselData.length === 0) return { prevprev: 0, prev: 0, current: 0, next: 0, nextnext: 0 };
    const prev = (currentIndex - 1 + carouselData.length) % carouselData.length;
    const next = (currentIndex + 1) % carouselData.length;
    const prevprev = (prev - 1 + carouselData.length) % carouselData.length;
    const nextnext = (next + 1) % carouselData.length;
    return { prevprev, prev, current: currentIndex, next, nextnext };
  };

  const handlePrevious = () => {
    if (carouselData.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + carouselData.length) % carouselData.length);
  };

  const handleNext = () => {
    if (carouselData.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % carouselData.length);
  };

  const visible = getVisibleImages();
  const progress = carouselData.length > 1 ? (currentIndex / (carouselData.length - 1)) * 100 : 100;

  if (loading) {
    return (
      <section className="py-10 md:py-20 bg-gradient-to-b from-slate-50 to-white min-h-[calc(100vh-100px)] overflow-x-hidden w-full max-w-full">
        <div className="mx-auto px-4 md:px-8 2xl:px-32 lg:px-12 w-full max-w-full overflow-x-hidden flex items-center justify-center min-h-[500px]">
          <LoadingSpinner message="Loading featured opportunities..." />
        </div>
      </section>
    );
  }

  if (carouselData.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-20 bg-gradient-to-b from-slate-50 to-white min-h-[calc(100vh-100px)] overflow-x-hidden w-full max-w-full">
      <div className="mx-auto px-4 md:px-8 2xl:px-32 lg:px-12 w-full max-w-full overflow-x-hidden">
        {/* Tagline */}
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-800">
            <span className="font-bold text-[#0a3d5c]">PITCH INVEST:</span> Where Your Capital Meets Next Big Idea.
          </h1>
        </div>
        {/* Desktop: horizontal layout (left card, carousel, right card) */}
        {/* Mobile: vertical layout (carousel on top, cards below) */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 md:gap-8">
          {/* Left Card - visible on desktop, moves below on mobile */}
          <div className="order-2 lg:order-1 w-full md:w-96 lg:w-[350px] z-20 flex lg:h-full">
            <div
              key={carouselData[currentIndex].left.id}
              className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer w-full flex flex-col lg:h-full"
              onClick={() => {
                if (carouselData[currentIndex].left.id) navigate(`/user/${carouselData[currentIndex].left.id}`);
              }}
            >
              {/* Header with background */}
              <div className="relative h-32 lg:h-36" style={{ backgroundImage: `url(${carouselData[currentIndex].left.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute -bottom-14 left-4">
                  <img src={carouselData[currentIndex].left.photo} alt={carouselData[currentIndex].left.fullName} className="w-32 h-32 lg:w-36 lg:h-36 shadow-lg rounded-full border-4 border-[#0a3d5c] object-cover" />
                </div>
                <div className="absolute top-2 right-2 flex flex-col items-center bg-white rounded-full p-1.5">
                  <img src={carouselData[currentIndex].left.companyLogo} alt={carouselData[currentIndex].left.companyName} className="w-10 h-10 rounded-full" />
                </div>
              </div>

              <div className="pt-10 px-4 pb-4 flex-1 flex flex-col">
                <div className="text-right text-sm font-semibold text-gray-700 mb-3">{carouselData[currentIndex].left.companyName}</div>

                <div className="space-y-1.5 text-sm mb-3">
                  <div><span className="font-semibold">Nome:</span> {carouselData[currentIndex].left.fullName}</div>
                  <div><span className="font-semibold">Startup:</span> {carouselData[currentIndex].left.projectName}</div>
                  <div><span className="font-semibold">Cidade:</span> {carouselData[currentIndex].left.city}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">País:</span> {carouselData[currentIndex].left.country} <span>{carouselData[currentIndex].left.countryFlag}</span>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    className="flex-1 bg-[#0a3d5c] hover:bg-[#0C3C5AFF] text-white font-semibold py-1.5 transition text-sm rounded-full hover:bg-white hover:text-[#0a3d5c] border-2 border-[#0a3d5c]"
                    onClick={(e) => { e.stopPropagation(); handleLeftCardMessageClick(); }}
                  >
                    Message
                  </button>
                  <button
                    className="flex-1 border-2 border-green-600 text-green-600 bg-white hover:bg-green-600 hover:text-white active:bg-green-700 active:border-green-700 rounded-full font-semibold py-1.5 transition text-sm"
                    onClick={(e) => { e.stopPropagation(); if (carouselData[currentIndex].left.id) { navigate(`/auction/${carouselData[currentIndex].left.id}`); } }}
                  >
                    Auction
                  </button>
                </div>

                <div className="text-center mb-3">
                  <div className="text-xl font-bold">{carouselData[currentIndex].left.capitalPercentage}% por {carouselData[currentIndex].left.capitalTotalValue}</div>
                  <div className="text-green-600 font-bold text-sm">{carouselData[currentIndex].left.commission}% Comissão</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  {carouselData[currentIndex].left.photos[0] && <img src={carouselData[currentIndex].left.photos[0]} alt="Product 1" className="w-full h-24 lg:h-28 object-cover rounded-lg" />}
                  {carouselData[currentIndex].left.photos[1] && <img src={carouselData[currentIndex].left.photos[1]} alt="Product 2" className="w-full h-24 lg:h-28 object-cover rounded-lg" />}
                </div>

                <div className="bg-gray-50 rounded-lg py-3 text-center mt-auto">
                  <div className="text-base font-bold">
                    {carouselData[currentIndex].left.description
                      ? truncateText(carouselData[currentIndex].left.description, 100)
                      : 'Project Description'}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">PUBLIC APPROVAL</div>
                  <div className="text-2xl font-bold text-green-600 mb-2">{carouselData[currentIndex].left.approvalRate}%</div>
                  <div className="flex justify-center gap-3 text-sm text-gray-600">
                    <button aria-label="Like" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700">
                      <ThumbsUp size={14} className="text-yellow-500" fill="#eab308" />
                      <span>{carouselData[currentIndex].left.likes}</span>
                    </button>
                    <button aria-label="Views" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700">
                      <Eye size={14} />
                      <span>{carouselData[currentIndex].left.views}</span>
                    </button>
                  </div>
                </div>
              </div>
              {leftCardMessageClick && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-30">
                  <div className="px-6 py-8 mt-[30%] text-center bg-[rgba(0,0,0,0.5)] w-full" style={{ clipPath: "polygon(0% 50%, 100% 0%, 100% 50%, 0% 100%)" }}>
                    <p className="text-lg font-bold tracking-widest text-white rotate-[350deg]">UNAVAILABLE</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Carousel - order-1 on mobile (top), order-2 on desktop (middle) */}
          <div className="order-1 lg:order-2 w-full lg:w-auto relative overflow-x-hidden" style={{ maxWidth: '100%' }}>
            {/* Left Arrow Button */}
            <button
              onClick={handlePrevious}
              className="hidden lg:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 z-30 border-orange-500 bg-transparent border hover:bg-orange-600 text-orange-500 hover:text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="relative flex items-center justify-center overflow-x-hidden overflow-y-visible" style={{ perspective: '1200px', minHeight: '500px', width: '100%', maxWidth: '100%', contain: 'layout' }}>
              {/* Previous Previous Image - Very Small - Clickable */}
              {carouselData[visible.prevprev] && (
                <img
                  src={carouselData[visible.prevprev].carouselImage}
                  alt="Previous Previous"
                  onClick={() => setCurrentIndex(visible.prevprev)}
                  className="hidden lg:block absolute w-[400px] h-[500px] object-cover rounded-lg opacity-60 transition-all duration-700 cursor-pointer hover:opacity-75 border-8 p-2 bg-white border-[#0a3d5c]"
                  style={{ transform: 'translateX(-800px) rotateY(45deg) scale(0.6) translateY(0)', zIndex: 0, clipPath: 'inset(0)' }}
                />
              )}
              {/* Previous Image - Clickable */}
              {carouselData[visible.prev] && (
                <img
                  src={carouselData[visible.prev].carouselImage}
                  alt="Previous"
                  onClick={() => setCurrentIndex(visible.prev)}
                  className="hidden lg:block absolute 2xl:w-[550px] 2xl:h-[450px] lg:h-[300px] w-[550px] h-[350px] object-cover rounded-lg opacity-80 transition-all duration-700 cursor-pointer hover:opacity-100 border-8 p-2 bg-white border-[#0a3d5c]"
                  style={{ transform: 'translateX(-500px) rotateY(25deg) scale(0.8) translateY(0)', zIndex: 1, clipPath: 'inset(0)' }}
                />
              )}

              {/* Current Image - Large with Shadow */}
              {carouselData[visible.current] && (
                <img
                  src={carouselData[visible.current].carouselImage}
                  alt="Current"
                  className={`relative w-full md:w-[500px] lg:w-[650px] 2xl:w-[700px] h-[350px] md:h-[400px] lg:h-[450px] 2xl:h-[450px] object-cover rounded-2xl transition-all duration-700 shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${isAnimating ? 'carousel-scale-animate' : ''} border-8 p-2 bg-white border-[#0a3d5c]`}
                  style={{ zIndex: 10, transform: 'translateY(0)' }}
                />
              )}

              {/* Next Image - Very Small - Clickable */}
              {carouselData[visible.next] && (
                <img
                  src={carouselData[visible.next].carouselImage}
                  alt="Next"
                  onClick={() => setCurrentIndex(visible.next)}
                  className="hidden lg:block absolute 2xl:w-[550px] 2xl:h-[450px] lg:h-[300px] w-[550px] h-[350px] object-cover rounded-lg opacity-80 transition-all duration-700 cursor-pointer hover:opacity-100 border-8 p-2 bg-white border-[#0a3d5c]"
                  style={{ transform: 'translateX(500px) rotateY(-25deg) scale(0.8) translateY(0)', zIndex: 1, clipPath: 'inset(0)' }}
                />
              )}
              {/* Next Next Image - Very Small - Clickable */}
              {carouselData[visible.nextnext] && (
                <img
                  src={carouselData[visible.nextnext].carouselImage}
                  alt="Next Next"
                  onClick={() => setCurrentIndex(visible.nextnext)}
                  className="hidden lg:block absolute w-[400px] h-[500px] object-cover rounded-lg opacity-60 transition-all duration-700 cursor-pointer hover:opacity-75 border-8 p-2 bg-white border-[#0a3d5c]"
                  style={{ transform: 'translateX(800px) rotateY(-45deg) scale(0.6) translateY(0)', zIndex: 0, clipPath: 'inset(0)' }}
                />
              )}
            </div>

            {/* Right Arrow Button */}
            <button
              onClick={handleNext}
              className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-16 z-30 bg-transparent border border-orange-500 hover:bg-orange-600 text-orange-500 hover:text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>

            {/* Navigation Dots + Progress Line */}
            <div className="mt-2">
              {/* Dots */}
              <div className="flex justify-center gap-2 mb-4">
                {carouselData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-orange-500 w-8' : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>

              {/* Mobile-only navigation buttons */}
              <div className="flex lg:hidden gap-4 justify-center mb-4">
                <button
                  onClick={handlePrevious}
                  className="border-orange-500 bg-transparent border hover:bg-orange-600 text-orange-500 hover:text-white p-2 rounded-full transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="bg-transparent border border-orange-500 hover:bg-orange-600 text-orange-500 hover:text-white p-2 rounded-full transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Progress track representing current position */}
              <div className="relative h-2 shadow-md rounded-full mx-auto w-2/3">
                {/* filled portion */}
                <div
                  className="absolute left-0 top-0 h-full bg-white rounded-full"
                  style={{ width: `${progress}%`, transition: 'width 600ms ease' }}
                />

                {/* little orange thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-2 bg-orange-500 rounded-sm shadow-lg"
                  style={{ left: `calc(${progress}% - 8px)`, transition: 'left 600ms ease' }}
                />
              </div>
              {/* subtle drop shadow under the progress track (visual only) */}
              <div className="mx-auto w-2/3 mt-2 pointer-events-none">
                <div className="w-full h-2 rounded-full bg-transparent shadow-[0_18px_40px_rgba(0,0,0,0.18)]" />
              </div>

            </div>

            {/* Navigation Buttons - Below Image */}
            <div className="flex justify-center gap-4">
              <Link to="/gallery">
                <button className="px-8 py-2.5 rounded-full border-2 bg-[#0a3d5c] text-white  font-semibold hover:bg-white hover:text-[#0a3d5c] hover:border-[#0a3d5c] transition-all duration-200 shadow-sm hover:shadow-md">
                  Innovation
                </button>
              </Link>
              <Link to="/investors">
                <button className="px-8 py-2.5 rounded-full border-2 border-[#0a3d5c] text-[#0a3d5c] font-semibold hover:bg-[#0a3d5c] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md">
                  Investor
                </button>
              </Link>
            </div>
          </div>

          {/* Right Card - Investor Profile */}
          <div className="order-3 w-full md:w-96 lg:w-[350px] flex lg:h-full">
            <Card className={`w-full bg-white shadow-xl hover:shadow-2xl transition-all rounded-2xl overflow-hidden flex flex-col lg:h-full ${isAnimating ? 'carousel-animate-left' : ''}`}>
              {/* Header area with background */}
              <div 
                className="h-32 lg:h-36 relative flex items-center justify-center bg-gradient-to-br from-[#0a3d5c] to-[#062a3d] flex-shrink-0"
                style={{
                  backgroundImage: carouselData[currentIndex]?.right?.coverImage 
                    ? `url(${carouselData[currentIndex].right.coverImage})` 
                    : undefined,
                  backgroundSize: carouselData[currentIndex]?.right?.coverImage ? "cover" : undefined,
                  backgroundPosition: carouselData[currentIndex]?.right?.coverImage ? "center center" : undefined,
                }}
              >
                <div className="text-white font-bold text-2xl lg:text-3xl tracking-wide bg-[#00000080] w-full h-full text-center flex items-center justify-center">{carouselData[currentIndex].right.company}</div>
              </div>

              {/* Avatar overlapping */}
              <div className="relative pb-5 px-6 bg-white flex-1 flex flex-col">
                <div className="absolute -top-14 left-4 flex h-36">
                  <div className="w-32 h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-[#0a3d5c] shadow-md bg-white">
                    <img src={carouselData[currentIndex].right.avatar} alt={carouselData[currentIndex].right.name} className="w-full h-full object-cover" />
                  </div>
                  <div className='flex flex-col justify-end h-36'>
                    <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-1">{carouselData[currentIndex].right.name}</h3>
                    <div className='flex w-full justify-center items-center gap-1'>
                      {carouselData[currentIndex].right.location && carouselData[currentIndex].right.location !== 'Location not specified' ? (
                        <div className="text-sm lg:text-base text-gray-500 mb-2">{carouselData[currentIndex].right.location}</div>
                      ) : (
                        <div className="text-sm lg:text-base text-gray-400 mb-2 italic">Location not specified</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-28 text-center flex-1 flex flex-col">
                  <div className="flex justify-center mb-3 gap-4">
                    <button 
                      onClick={() => carouselData[currentIndex].right.id && navigate(`/messages/${carouselData[currentIndex].right.id}`)}
                      className="flex-1 text-sm border-[#0a3d5c] border-2 bg-white hover:bg-[#0a3d5c] hover:text-white active:bg-[#093550] text-[#0a3d5c] font-semibold py-1.5 rounded-full shadow-sm transition-all"
                    >
                      Message
                    </button>
                    <button 
                      onClick={() => carouselData[currentIndex].right.id && navigate(`/investor/${carouselData[currentIndex].right.id}`)}
                      className="flex-1 text-sm border-[#0a3d5c] border-2 bg-white hover:bg-[#0a3d5c] hover:text-white active:bg-[#093550] text-[#0a3d5c] font-semibold py-1.5 rounded-full shadow-sm transition-all"
                    >
                      View Profile
                    </button>
                  </div>

                  {carouselData[currentIndex].right.portfolio.length > 0 && (
                    <>
                      <div className="text-base font-semibold text-gray-700 mb-3 uppercase">Portfolio Companies</div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {carouselData[currentIndex].right.portfolio.slice(0, 6).map((item, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div className="w-18 h-18 lg:w-20 lg:h-20 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden border border-gray-200">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {carouselData[currentIndex].right.description && (
                    <div className="mt-auto">
                      <div className='text-xl font-bold mt-5'>
                        Company Description
                      </div>
                      <div className='text-base mt-1 text-gray-700 leading-relaxed'>
                        {truncateText(carouselData[currentIndex].right.description, 200)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div >
    </section >
  );
}
