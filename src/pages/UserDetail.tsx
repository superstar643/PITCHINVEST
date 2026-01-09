import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ThumbsUp, Eye, MoveLeft, Share2, Lock, Edit } from 'lucide-react';
import { fetchUserProfile, fetchUserProfileAsAdmin, getAvailableOptions, type ProfileData } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const color = '#0a3d5c';

const USE_STATIC_PREVIEW = false; // set true only for local UI preview

const UserDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { isAdmin } = useAdmin();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isOwnProfile = currentUser && id === currentUser.id;

  useEffect(() => {
    async function loadProfile() {
      try {
        if (USE_STATIC_PREVIEW) {
          const mock: ProfileData = {
            user: {
              id: 'demo-user',
              user_type: 'Inventor',
              full_name: 'Demo User',
              personal_email: 'demo@example.com',
              telephone: '+1 234 567 890',
              country: 'USA',
              city: 'New York',
              cover_image_url: '',
              photo_url: '',
              created_at: new Date().toISOString(),
            },
            profile: {
              id: 'demo-profile',
              user_id: 'demo-user',
              project_name: 'Demo Project',
              project_category: 'Technology',
              company_name: 'Demo Company',
              company_nif: '123456789',
              company_telephone: '+1 987 654 321',
              smart_money: 'Yes',
              total_sale_of_project: '1,000,000',
              investment_preferences: 'Equity, Licensing',
              inventor_name: 'Demo Inventor',
              license_number: 'LIC-2025-001',
              release_date: '2025-12-31',
              initial_license_value: '250,000',
              exploitation_license_royalty: '5%',
              patent_sale: 'Available',
              investors_count: '3',
              created_at: new Date().toISOString(),
            },
            proposals: {
              id: 'demo-proposal',
              user_id: 'demo-user',
              equity_capital_percentage: '15%',
              equity_total_value: '500,000',
              license_fee: '50,000',
              licensing_royalties_percentage: '3%',
              franchisee_investment: '200,000',
              monthly_royalties: '5,000',
              patent_upfront_fee: '80,000',
              patent_royalties: '4%',
              created_at: new Date().toISOString(),
            },
            materials: {
              id: 'demo-materials',
              user_id: 'demo-user',
              pitch_video_url: null,
              photos_urls: [],
              pitch_videos_urls: [],
              description: 'Demo description text here.',
              fact_sheet: 'Demo fact sheet content.',
              technical_sheet: 'Demo technical sheet content.',
              created_at: new Date().toISOString(),
            },
          };
          setProfileData(mock);
          setIsLoggedIn(true);
          setLoading(false); // Set loading to false immediately in preview mode
          return;
        }

        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);

        // Fetch profile data
        if (id) {
          let data: ProfileData;
          
          // If admin, use admin function
          if (isAdmin) {
            try {
              data = await fetchUserProfileAsAdmin(id);
            } catch (adminError: any) {
              console.error('Admin fetch failed:', adminError);
              // Show error but still try regular fetch as fallback
              try {
                data = await fetchUserProfile(id);
              } catch (fallbackError) {
                console.error('Fallback fetch also failed:', fallbackError);
                throw adminError; // Throw original admin error
              }
            }
          } else {
            // Regular user fetch
            data = await fetchUserProfile(id);
          }
          
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id || USE_STATIC_PREVIEW) loadProfile();
  }, [id, isAdmin]);

  // Skip loading check in static preview mode
  if (!USE_STATIC_PREVIEW && loading) {
    return (
      <LoadingSpinner fullScreen />
    );
  }

  if (!profileData || !profileData.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
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

  const { user, profile, proposals, materials } = profileData;
  const availableOptions = getAvailableOptions(proposals, profile);

  // Determine visible photos based on login status
  const allPhotos = materials?.photos_urls || [];
  const visiblePhotos = isLoggedIn ? allPhotos : allPhotos.slice(0, 3);

  const handleMessageClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      navigate(`/messages/${user.id}`);
    }
  };

  return (
    <>
      <div className="bg-white pt-20 px-4 md:px-6 mb-12 pb-12">
        <div className="relative max-w-5xl mx-auto">
          {/* Header banner */}
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
            
            {/* Top controls + avatar */}
            <div className="flex items-start gap-6 z-10 bg-white/10 backdrop-blur-md p-4 rounded-b-2xl w-full">
              <div className="flex-shrink-0">
                {user.photo_url ? (
                  <img 
                    src={user.photo_url} 
                    alt={user.full_name} 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" 
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-[#0a3d5c] flex items-center justify-center text-white text-2xl font-bold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{user.full_name}</h1>
                    {profile?.project_name && (
                      <div className="text-sm text-white/90">{profile.project_name}</div>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    {isOwnProfile && (
                      <button 
                        onClick={() => navigate('/settings')} 
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a3d5c] text-white shadow-sm text-sm hover:bg-[#0a3d5c]/90 transition whitespace-nowrap"
                      >
                        <Edit size={14} /> Edit Profile
                      </button>
                    )}
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
                            text: profile?.project_name || '', 
                            url: window.location.href 
                          });
                        }
                      }}
                    >
                      <Share2 size={14} /> Share
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-sm text-white flex items-center gap-2 flex-wrap">
                  {user.city && user.country && (
                    <span>{user.city}, {user.country}</span>
                  )}
                  {profile?.project_category && (
                    <span className="text-xs px-2 py-1 bg-white/20 rounded">{profile.project_category}</span>
                  )}
                  <span className="text-xs px-2 py-1 bg-white/20 rounded">{user.user_type}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Options - Only show if they have values */}
          {availableOptions.length > 0 && (
            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4 text-gray-900">Available for:</h3>
              <div className="flex flex-wrap gap-2">
                {availableOptions.map((option, idx) => (
                  <span 
                    key={idx} 
                    className="px-4 py-2 bg-[#0a3d5c] text-white rounded-full text-sm font-medium"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Main card */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                {materials?.description && (
                  <div>
                    <h3 className="font-semibold mb-2">About {user.full_name}</h3>
                    <p className="text-sm text-gray-600">{materials.description}</p>
                  </div>
                )}

                {/* Project Information */}
                {profile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Project Information</h4>
                    <div className="space-y-2 text-sm">
                      {profile.project_name && (
                        <div><span className="font-medium">Project:</span> {profile.project_name}</div>
                      )}
                      {profile.project_category && (
                        <div><span className="font-medium">Category:</span> {profile.project_category}</div>
                      )}
                      {profile.company_name && (
                        <div><span className="font-medium">Company:</span> {profile.company_name}</div>
                      )}
                      {profile.smart_money && (
                        <div><span className="font-medium">Smart Money:</span> {profile.smart_money}</div>
                      )}
                      {profile.total_sale_of_project && (
                        <div><span className="font-medium">Total Sale of Project:</span> {profile.total_sale_of_project}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sales Conditions */}
                {proposals && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <h3 className="font-semibold text-lg mb-4">Sales Conditions</h3>
                    <div className="space-y-4">
                      {/* Investment Offer (%) */}
                      {(proposals.equity_capital_percentage || proposals.equity_total_value) && (
                        <div className="border-l-4 border-[#0a3d5c] pl-4 py-2">
                          <h4 className="font-semibold text-base mb-2">Investment Offer (%)</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            {proposals.equity_capital_percentage && (
                              <div><span className="font-medium">Equity:</span> {proposals.equity_capital_percentage}</div>
                            )}
                            {proposals.equity_total_value && (
                              <div><span className="font-medium">Investment Amount:</span> {proposals.equity_total_value}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Brand Exploitation Rights */}
                      {(proposals.license_fee || proposals.licensing_royalties_percentage) && (
                        <div className="border-l-4 border-blue-500 pl-4 py-2">
                          <h4 className="font-semibold text-base mb-2">Brand Exploitation Rights</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            {proposals.license_fee && (
                              <div><span className="font-medium">Initial Licensing Fee:</span> {proposals.license_fee}</div>
                            )}
                            {proposals.licensing_royalties_percentage && (
                              <div><span className="font-medium">Royalties (%):</span> {proposals.licensing_royalties_percentage}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Franchise */}
                      {(proposals.franchisee_investment || proposals.monthly_royalties) && (
                        <div className="border-l-4 border-green-500 pl-4 py-2">
                          <h4 className="font-semibold text-base mb-2">Franchise</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            {proposals.franchisee_investment && (
                              <div><span className="font-medium">Franchise Fee:</span> {proposals.franchisee_investment}</div>
                            )}
                            {proposals.monthly_royalties && (
                              <div><span className="font-medium">Royalties (%):</span> {proposals.monthly_royalties}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Patent Licensing */}
                      {(proposals.patent_upfront_fee || proposals.patent_royalties) && (
                        <div className="border-l-4 border-purple-500 pl-4 py-2">
                          <h4 className="font-semibold text-base mb-2">Patent Licensing</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            {proposals.patent_upfront_fee && (
                              <div><span className="font-medium">Upfront Fee:</span> {proposals.patent_upfront_fee}</div>
                            )}
                            {proposals.patent_royalties && (
                              <div><span className="font-medium">Royalties (%):</span> {proposals.patent_royalties}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Photos - Limited for visitors */}
                {allPhotos.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {visiblePhotos.map((url: string, idx: number) => (
                        <div key={idx} className="w-full h-52 md:h-60 bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={url} 
                            alt={`photo-${idx}`} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ))}
                    </div>
                    {!isLoggedIn && allPhotos.length > 3 && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                        <Lock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm text-blue-800">
                          <Link to="/login" className="font-medium underline">
                            Sign in to see all {allPhotos.length} photos
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pitch Video - Only for logged-in users */}
                {isLoggedIn && materials?.pitch_video_url && (
                  <div>
                    <h3 className="font-semibold mb-4">Pitch Video</h3>
                    <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <video 
                        src={materials.pitch_video_url} 
                        controls 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Additional Videos - Only for logged-in users */}
                {isLoggedIn && materials?.pitch_videos_urls && materials.pitch_videos_urls.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">Additional Videos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {materials.pitch_videos_urls.map((url: string, idx: number) => (
                        <div key={idx} className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <video 
                            src={url} 
                            controls 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents - Only for logged-in users */}
                {isLoggedIn && (materials?.fact_sheet || materials?.technical_sheet) && (
                  <div>
                    <h3 className="font-semibold mb-4">Documents</h3>
                    <div className="space-y-2">
                      {materials.fact_sheet && (
                        <a 
                          href={materials.fact_sheet} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                        >
                          <span className="text-sm">Fact Sheet</span>
                          <span className="text-xs text-[#0a3d5c]">Open</span>
                        </a>
                      )}
                      {materials.technical_sheet && (
                        <a 
                          href={materials.technical_sheet} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                        >
                          <span className="text-sm">Technical Sheet</span>
                          <span className="text-xs text-[#0a3d5c]">Open</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Locked content message for visitors */}
                {!isLoggedIn && (materials?.pitch_video_url || (materials?.pitch_videos_urls && materials.pitch_videos_urls.length > 0) || materials?.fact_sheet || materials?.technical_sheet) && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <Lock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-blue-800 mb-2">
                      Sign in to view videos and documents
                    </p>
                    <Link 
                      to="/login" 
                      className="text-sm font-medium text-[#0a3d5c] underline"
                    >
                      Sign in now
                    </Link>
                  </div>
                )}
              </div>

              {/* Right: actions / facts */}
              <div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleMessageClick}
                    className="w-full px-4 py-3 rounded-full bg-[#0a3d5c] text-white font-medium hover:bg-[#062a3d] transition"
                  >
                    Message
                  </button>
                  <button 
                    onClick={() => navigate(`/auction/${user.id}`)} 
                    className="w-full px-4 py-3 rounded-full border border-green-600 text-green-600 font-medium hover:bg-green-50 transition"
                  >
                    Auction
                  </button>
                </div>

                <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border">
                  <h4 className="text-xs text-gray-500 mb-4">Key Facts</h4>
                  <div className="space-y-2 text-sm">
                    {user.user_type && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Type</span>
                        <span className="font-semibold">{user.user_type}</span>
                      </div>
                    )}
                    {profile?.company_name && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Company</span>
                        <span className="font-semibold">{profile.company_name}</span>
                      </div>
                    )}
                    {profile?.project_name && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Project</span>
                        <span className="font-semibold">{profile.project_name}</span>
                      </div>
                    )}
                    {user.city && user.country && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Location</span>
                        <span className="font-semibold">{user.city}, {user.country}</span>
                      </div>
                    )}
                    {profile?.project_category && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500">Category</span>
                        <span className="font-semibold">{profile.project_category}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border">
                  <h4 className="text-xs text-gray-500 mb-3">Share</h4>
                  <div className="flex gap-3">
                    <button 
                      className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center hover:bg-gray-100 transition"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        // You can add a toast notification here
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

export default UserDetail;
