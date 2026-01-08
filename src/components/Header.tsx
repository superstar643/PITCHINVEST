import React, { useState } from 'react';
import { Button } from './ui/button';
import { Search, Menu, LogOut, User, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import Sidebar from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { fetchUserProfile } from '@/lib/profile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch user profile data similar to UserDetail page to get correct photo_url
  const [userProfileData, setUserProfileData] = React.useState<{ photo_url: string | null; full_name: string } | null>(null);
  
  // Fetch profile data when user is available
  React.useEffect(() => {
    async function loadUserProfile() {
      if (user?.id) {
        try {
          const data = await fetchUserProfile(user.id);
          if (data.user) {
            setUserProfileData({
              photo_url: data.user.photo_url,
              full_name: data.user.full_name
            });
          }
        } catch (error) {
          console.error('Error loading user profile for header:', error);
          // Fallback to useAuth profile data if fetch fails
          setUserProfileData({
            photo_url: profile?.photo_url || null,
            full_name: profile?.full_name || ''
          });
        }
      } else {
        setUserProfileData(null);
      }
    }
    
    loadUserProfile();
  }, [user?.id, profile?.photo_url, profile?.full_name]);
  
  // Keep track of the last known user to prevent flickering during transitions
  const [lastKnownUser, setLastKnownUser] = React.useState<typeof user>(null);
  const [lastKnownProfileData, setLastKnownProfileData] = React.useState<typeof userProfileData>(null);
  
  // Update last known user/profile when they exist
  React.useEffect(() => {
    if (user) {
      setLastKnownUser(user);
    } else if (!loading) {
      // Clear last known user only when loading is complete and user is null
      // This prevents clearing during brief transitions
      setLastKnownUser(null);
    }
    if (userProfileData) {
      setLastKnownProfileData(userProfileData);
    } else if (!loading && !user) {
      // Clear profile when user is definitely logged out
      setLastKnownProfileData(null);
    }
  }, [user, userProfileData, loading]);
  
  // Use current user/profile if available, otherwise fall back to last known
  const displayUser = user || lastKnownUser;
  const displayProfileData = userProfileData || lastKnownProfileData;

  // React to auth state changes - track state transitions
  React.useEffect(() => {
    console.log('🔍 Header Auth State:', { 
      hasUser: !!user,
      userId: user?.id,
      email: user?.email, 
      hasProfile: !!profile,
      loading,
      willShowProfile: !!user,
      willShowLogin: !user && !loading
    });
  }, [user, profile, loading]);

  // Ensure body scrollbar remains visible when dropdown is open
  React.useEffect(() => {
    if (isDropdownOpen) {
      // Prevent body from getting overflow:hidden
      const preventScrollLock = () => {
        const body = document.body;
        if (body.style.overflow === 'hidden') {
          body.style.overflow = '';
          body.style.paddingRight = '';
        }
      };

      // Check immediately and set up observer
      preventScrollLock();
      const observer = new MutationObserver(preventScrollLock);

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['style']
      });

      // Also check periodically as a fallback
      const interval = setInterval(preventScrollLock, 100);

      return () => {
        observer.disconnect();
        clearInterval(interval);
        // Clean up on close
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isDropdownOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    if (isSigningOut) {
      return; // Prevent multiple clicks
    }

    try {
      setIsSigningOut(true);
      console.log('🚪 Header: Starting sign out...');
      
      // Call signOut - this will clear state immediately and trigger onAuthStateChange
      await signOut();
      
      console.log('✅ Header: Sign out completed');
      console.log('🔍 Header: User state after signOut:', { user: !!user });
      
      // Show success toast
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
        duration: 3000,
      });
      
      // Navigate immediately - state should already be cleared by signOut()
      // Use a small delay to ensure state propagates and UI updates
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } catch (error) {
      console.error('❌ Header: Sign out error:', error);
      
      // Show error toast
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSigningOut(false);
    }
  };


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md overflow-x-hidden w-full" style={{ zIndex: 50 }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-3 w-full">
          <div className="flex items-center justify-between">
            <img 
              src="/assets/logo1.png"
              alt="Pitch Invest Logo"
              className="h-10 cursor-pointer"
              onClick={() => window.location.href = '/'}
            />
            
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex text-[#0a3d5c] hover:bg-[#0a3d5c]/10"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <div className="hidden md:block">
                <LanguageSelector />
              </div>
              
              {/* Show avatar if user exists (or was recently logged in), otherwise show login buttons */}
              {/* Only show login buttons when user is NOT signed in and not loading */}
              {/* Use displayUser to prevent flickering during page transitions */}
              {displayUser ? (
                <div className="flex items-center ml-2" style={{ position: 'relative', zIndex: 100 }}>
                  <DropdownMenu 
                    modal={false}
                    onOpenChange={(open) => setIsDropdownOpen(open)}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="cursor-pointer hover:opacity-80 transition-opacity rounded-full focus:outline-none"
                        style={{ 
                          padding: 0,
                          border: 'none',
                          background: 'transparent',
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          minHeight: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                        aria-label="User menu"
                        onClick={(e) => {
                          console.log('Avatar button clicked!', { user: !!user, profile: !!profile });
                        }}
                      >
                        {displayProfileData?.photo_url ? (
                          <img 
                            src={displayProfileData.photo_url} 
                            alt={displayProfileData?.full_name || displayUser.email || 'User'} 
                            className="w-10 h-10 rounded-full shadow-lg object-cover" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full shadow-lg bg-[#0a3d5c] flex items-center justify-center text-white text-sm font-semibold">
                            {(displayProfileData?.full_name?.[0] || displayUser.email?.[0] || 'U').toUpperCase()}
                          </div>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56" 
                      style={{ 
                        maxWidth: 'calc(100vw - 20px)'
                      }}
                    >
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{displayProfileData?.full_name || displayUser.email || 'User'}</p>
                          {profile?.user_type && (
                            <p className="text-xs text-muted-foreground">{profile.user_type}</p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => navigate(`/user/${displayUser.id}`)}
                        className="cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => navigate('/settings')}
                        className="cursor-pointer"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="text-red-600 focus:text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : !displayUser && !loading ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login">
                    <Button 
                      variant="ghost"
                      className="text-gray-700 hover:text-[#0a3d5c] font-medium"
                    >
                      Login
                    </Button>
                  </Link>
                  
                  <Link to="/register">
                    <Button 
                      className="bg-[#0a3d5c] hover:bg-[#0a3d5c]/90 text-white font-medium px-6"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : null}
              
              <Button 
                variant="ghost"
                size="icon"
                className="text-[#0a3d5c] hover:bg-[#0a3d5c]/10 ml-1 sm:ml-2"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default Header;

