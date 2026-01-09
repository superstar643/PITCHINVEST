import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ThumbsUp, Eye, MoveLeft, Share2, Lock } from 'lucide-react';
import { fetchUserProfile, getAvailableOptions, type ProfileData } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import investers from '@/lib/investersData';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const InvestorDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);

        // Fetch profile data
        if (id) {
          let data: ProfileData | null = null;
          
          // Check if ID is numeric (investor IDs in investersData are numeric like 101, 102)
          const isNumericId = !isNaN(Number(id));
          
          if (isNumericId) {
            // For numeric IDs, check static data first
            const staticInvestor = investers.find(inv => String(inv.id) === String(id));
            
            if (staticInvestor) {
              // Map static investor data to ProfileData format
              data = {
                user: {
                  id: String(staticInvestor.id),
                  user_type: 'Investor',
                  full_name: staticInvestor.name,
                  personal_email: '',
                  telephone: '',
                  country: staticInvestor.country || '',
                  city: staticInvestor.city || '',
                  cover_image_url: staticInvestor.coverImage || null,
                  photo_url: staticInvestor.avatar || null,
                  created_at: new Date().toISOString(),
                },
                profile: {
                  id: `profile-${staticInvestor.id}`,
                  user_id: String(staticInvestor.id),
                  project_name: staticInvestor.projectInfo?.title || null,
                  project_category: staticInvestor.projectInfo?.category || null,
                  company_name: null,
                  company_nif: null,
                  company_telephone: null,
                  smart_money: null,
                  total_sale_of_project: null,
                  investment_preferences: staticInvestor.description || null,
                  inventor_name: null,
                  license_number: null,
                  release_date: null,
                  initial_license_value: null,
                  exploitation_license_royalty: null,
                  patent_sale: null,
                  investors_count: null,
                  created_at: new Date().toISOString(),
                },
                proposals: null,
                materials: {
                  id: `materials-${staticInvestor.id}`,
                  user_id: String(staticInvestor.id),
                  pitch_video_url: staticInvestor.videoPitch || null,
                  photos_urls: staticInvestor.images || [],
                  pitch_videos_urls: staticInvestor.presentationVideos || [],
                  description: staticInvestor.description || null,
                  fact_sheet: staticInvestor.docs?.find(d => d.name?.includes('Technical') || d.name?.includes('Fact'))?.url || null,
                  technical_sheet: staticInvestor.docs?.find(d => d.name?.includes('Technical') || d.name?.includes('Presentation'))?.url || null,
                  created_at: new Date().toISOString(),
                },
              };
            }
          } else {
            // For UUID IDs, try to fetch from Supabase
            try {
              data = await fetchUserProfile(id);
              // If fetched user is not an Investor, set to null
              if (data && data.user && data.user.user_type !== 'Investor') {
                data = null;
              }
            } catch (error) {
              console.error('Error fetching from Supabase:', error);
              data = null;
            }
          }
          
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadProfile();
  }, [id]);

  if (loading) {
    return (
      <LoadingSpinner fullScreen />
    );
  }

  if (!profileData || !profileData.user || profileData.user.user_type !== 'Investor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Investor not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-[#0a3d5c] text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { user, profile } = profileData;

  const handleMessageClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      navigate(`/messages/${user.id}`);
    }
  };

  return (
    <>
      <div className="bg-white pt-20 px-4 md:px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full z-1 md:h-96 sm:h-80 flex flex-col-reverse rounded-2xl overflow-hidden shadow-sm">
            {user.cover_image_url ? (
              <img 
                src={user.cover_image_url} 
                alt="header-bg" 
                className="w-full h-full object-cover absolute top-0 left-0 z-0" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0a3d5c] to-[#062a3d] absolute top-0 left-0 z-0" />
            )}
            
            <div className="z-10 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-b-2xl w-full">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                  {user.photo_url ? (
                    <img
                      src={user.photo_url}
                      alt={user.full_name}
                      className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg bg-[#0a3d5c] flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                        {user.full_name}
                      </h1>
                      {profile?.investment_preferences && (
                        <div className="text-sm text-white/90 mt-1 line-clamp-2">
                          {profile.investment_preferences}
                        </div>
                      )}
                    </div>
                    <div className="sm:ml-auto flex items-center justify-center sm:justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border shadow-sm text-sm hover:bg-gray-50 transition"
                      >
                        <MoveLeft size={16} /> Back
                      </button>
                      <button
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border shadow-sm text-sm hover:bg-gray-50 transition"
                        onClick={() => {
                          if (navigator?.share) {
                            navigator.share({
                              title: user.full_name,
                              text: profile?.investment_preferences || '',
                              url: window.location.href,
                            });
                          }
                        }}
                      >
                        <Share2 size={14} /> Share
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-white flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {user.city && user.country && (
                      <span className="whitespace-nowrap">
                        {user.city}, {user.country}
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 bg-white/20 rounded">
                      Investor
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left / main column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Investment Preferences */}
              {profile?.investment_preferences && (
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <h3 className="font-semibold text-lg mb-3">Investment Preferences</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{profile.investment_preferences}</p>
                </div>
              )}

              {/* About Section - Optional description if available */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="font-semibold text-lg mb-3">About</h3>
                <p className="text-sm text-gray-600">
                  {profile?.investment_preferences 
                    ? `Experienced ${user.user_type || 'Investor'} focused on investment opportunities. ${profile.investment_preferences}`
                    : `Experienced ${user.user_type || 'Investor'} with expertise in various investment sectors.`}
                </p>
              </div>
            </div>

            {/* Right column: actions and info */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleMessageClick}
                    className="w-full px-4 py-3 rounded-full bg-[#0a3d5c] text-white font-medium hover:bg-[#062a3d] transition"
                  >
                    Message
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <h4 className="text-xs text-gray-500 mb-3">Key Facts</h4>
                <div className="space-y-2 text-sm">
                  {user.user_type && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Type</span>
                      <span className="font-semibold">{user.user_type}</span>
                    </div>
                  )}
                  {user.city && user.country && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Location</span>
                      <span className="font-semibold">{user.city}, {user.country}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <h4 className="text-xs text-gray-500 mb-3">Share</h4>
                <div className="flex gap-3">
                  <button 
                    className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center hover:bg-gray-100 transition"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                  >
                    🔗
                  </button>
                  <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center hover:bg-gray-100 transition">
                    🐦
                  </button>
                  <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center hover:bg-gray-100 transition">
                    📘
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              You need to create an account to send messages. Please register first.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setShowLoginModal(false);
                navigate('/register');
              }}
              className="flex-1 px-4 py-2 bg-[#0a3d5c] text-white rounded-lg font-medium hover:bg-[#062a3d] transition"
            >
              Register
            </button>
            <button
              onClick={() => {
                setShowLoginModal(false);
                navigate('/login');
              }}
              className="flex-1 px-4 py-2 border border-[#0a3d5c] text-[#0a3d5c] rounded-lg font-medium hover:bg-[#0a3d5c]/10 transition"
            >
              Sign In
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvestorDetail;
