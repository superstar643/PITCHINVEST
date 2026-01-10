import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GalleryCard } from '@/components/GalleryCard';
import { MoveLeft, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchGalleryItems, fetchGalleryItemById, type GalleryItem as DBGalleryItem, incrementProjectViews, toggleProjectLike } from '@/lib/projects';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const color = '#0a3d5c';

interface GalleryItem {
    id: string | number;
    title: string;
    artist: string;
    subtitle?: string;
    imageUrl: string;
    images?: string[];
    category?: string;
    views: number;
    availableStatus: boolean;
    availableLabel?: string;
    badges?: string[];
    likes: number;
    author?: {
        name: string;
        avatarUrl?: string;
        country?: string;
        verified?: boolean;
    };
    actions?: string[];
    date?: string;
    description?: string;
    location?: string;
    project_id?: string;
}

interface BidData {
    currentBid: number;
    totalBids: number;
    hasBids: boolean;
}

const GalleryDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const [item, setItem] = useState<GalleryItem | null>(null);
    const [relatedItems, setRelatedItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [bidData, setBidData] = useState<BidData>({ currentBid: 0, totalBids: 0, hasBids: false });
    const [projectData, setProjectData] = useState<any>(null);
    const [startingAuction, setStartingAuction] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [hasLiked, setHasLiked] = useState(false);

    useEffect(() => {
        if (id) {
            loadGalleryItem();
        }
    }, [id]);

    // Check like status when user changes
    useEffect(() => {
        if (user && item?.project_id && item?.id) {
            const checkLikeStatus = async () => {
                try {
                    // First check gallery_engagement (preferred for gallery items)
                    const { data: galleryEngagement, error: galleryError } = await supabase
                        .from('gallery_engagement')
                        .select('liked')
                        .eq('gallery_item_id', item.id.toString())
                        .eq('user_id', user.id)
                        .maybeSingle();
                    
                    // If there's an RLS error (like 406), treat as no engagement yet
                    if (galleryError && galleryError.code !== 'PGRST116') {
                        console.error('Error checking gallery engagement:', galleryError);
                    }
                    
                    if (galleryEngagement) {
                        setHasLiked(galleryEngagement.liked || false);
                        return;
                    }
                    
                    // Fallback to project_engagement
                    const { data: projectEngagement, error: projectError } = await supabase
                        .from('project_engagement')
                        .select('liked')
                        .eq('project_id', item.project_id)
                        .eq('user_id', user.id)
                        .maybeSingle();
                    
                    // If there's an RLS error (like 406), treat as no engagement yet
                    if (projectError && projectError.code !== 'PGRST116') {
                        console.error('Error checking project engagement:', projectError);
                    }
                    
                    setHasLiked(projectEngagement?.liked || false);
                } catch (error) {
                    console.error('Error checking like status:', error);
                    setHasLiked(false);
                }
            };
            checkLikeStatus();
        } else {
            setHasLiked(false);
        }
    }, [user, item?.project_id, item?.id]);
    const loadGalleryItem = async () => {
        try {
            setLoading(true);
            
            if (!id) {
                navigate('/gallery');
                return;
            }

            // Fetch the specific gallery item by ID
            const galleryItem = await fetchGalleryItemById(id);

            if (!galleryItem) {
                toast({
                    title: 'Not Found',
                    description: 'Gallery item not found or not yet approved',
                    variant: 'destructive',
                });
                navigate('/gallery');
                return;
            }

            // Fetch project data for investment information
            if (galleryItem.project_id) {
                const { data: project, error: projectError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', galleryItem.project_id)
                    .maybeSingle();
                
                if (projectError && projectError.code !== 'PGRST116') {
                    console.error('Error fetching project data:', projectError);
                }
                
                if (project) {
                    setProjectData(project);
                }
            }

            // Fetch bid data (check if bids table exists, otherwise use project data)
            await loadBidData(galleryItem.project_id);

            // Increment views when page loads (only if project_id exists)
            if (galleryItem.project_id) {
                try {
                    await incrementProjectViews(galleryItem.project_id);
                } catch (error) {
                    console.error('Error incrementing views:', error);
                    // Don't show error to user, just log it
                }
            }

            // Check if current user has liked this project
            // Check both project_engagement and gallery_engagement
            if (user && galleryItem.project_id) {
                try {
                    // First check gallery_engagement (preferred for gallery items)
                    const { data: galleryEngagement, error: galleryError } = await supabase
                        .from('gallery_engagement')
                        .select('liked')
                        .eq('gallery_item_id', galleryItem.id)
                        .eq('user_id', user.id)
                        .maybeSingle();
                    
                    // If there's an RLS error (like 406), treat as no engagement yet
                    if (galleryError && galleryError.code !== 'PGRST116') {
                        console.error('Error checking gallery engagement:', galleryError);
                    }
                    
                    if (galleryEngagement) {
                        setHasLiked(galleryEngagement.liked || false);
                    } else {
                        // Fallback to project_engagement
                        const { data: projectEngagement, error: projectError } = await supabase
                            .from('project_engagement')
                            .select('liked')
                            .eq('project_id', galleryItem.project_id)
                            .eq('user_id', user.id)
                            .maybeSingle();
                        
                        // If there's an RLS error (like 406), treat as no engagement yet
                        if (projectError && projectError.code !== 'PGRST116') {
                            console.error('Error checking project engagement:', projectError);
                        }
                        
                        setHasLiked(projectEngagement?.liked || false);
                    }
                } catch (error) {
                    // User hasn't liked yet or table doesn't exist
                    console.error('Error checking like status:', error);
                    setHasLiked(false);
                }
            }

            // Convert DB gallery item to UI format
            const badges: string[] = [];
            if (galleryItem.featured) badges.push('FEATURED');
            if (galleryItem.author_verified) badges.push('VALIDATED');
            if ((galleryItem.likes || 0) > 100 || (galleryItem.views || 0) > 10000) {
                badges.push('TRENDING');
            }
            if (galleryItem.badges && galleryItem.badges.length > 0) {
                badges.push(...galleryItem.badges);
            }

            const convertedItem: GalleryItem = {
                id: galleryItem.id,
                title: galleryItem.title,
                artist: galleryItem.artist || galleryItem.author_name || 'Unknown',
                subtitle: galleryItem.subtitle,
                imageUrl: galleryItem.image_url || galleryItem.images?.[0] || '/placeholder.svg',
                images: galleryItem.images && galleryItem.images.length > 0 
                    ? galleryItem.images 
                    : [galleryItem.image_url].filter(Boolean),
                category: galleryItem.category,
                views: galleryItem.views || 0,
                availableStatus: galleryItem.available_status ?? true,
                availableLabel: galleryItem.available_label || (galleryItem.available_status ? 'Available' : 'Unavailable'),
                badges: badges.length > 0 ? badges : undefined,
                likes: galleryItem.likes || 0,
                author: galleryItem.author_name ? {
                    name: galleryItem.author_name,
                    avatarUrl: galleryItem.author_avatar_url || undefined,
                    country: galleryItem.author_country || undefined,
                    verified: galleryItem.author_verified || false,
                } : undefined,
                actions: galleryItem.actions && galleryItem.actions.length > 0 ? galleryItem.actions : undefined,
                date: galleryItem.date,
                description: galleryItem.description,
                location: galleryItem.location || galleryItem.author_country,
                project_id: galleryItem.project_id,
            };

            setItem(convertedItem);

            // Reload item to get updated views count
            const updatedItem = await fetchGalleryItemById(id);
            if (updatedItem) {
                const updatedConvertedItem: GalleryItem = {
                    ...convertedItem,
                    views: updatedItem.views || convertedItem.views,
                    likes: updatedItem.likes || convertedItem.likes,
                };
                setItem(updatedConvertedItem);
            }

            // Load related items (same category, excluding current)
            await loadRelatedItems(galleryItem.category, galleryItem.id);
        } catch (error: any) {
            console.error('Error loading gallery item:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to load gallery item',
                variant: 'destructive',
            });
            navigate('/gallery');
        } finally {
            setLoading(false);
        }
    };

    const loadBidData = async (projectId?: string) => {
        try {
            if (!projectId) {
                setBidData({ currentBid: 0, totalBids: 0, hasBids: false });
                return;
            }

            // Try to fetch from bids table if it exists
            // Use auction_id only (project_id doesn't exist in bids table)
            const { data: bids, error } = await supabase
                .from('bids')
                .select('bid_amount, auction_id')
                .eq('auction_id', projectId)
                .order('bid_amount', { ascending: false });

            if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
                // PGRST116/42P01 = table doesn't exist, which is okay
                console.error('Error fetching bids:', error);
            }

            if (bids && bids.length > 0) {
                // Handle bid_amount field
                const amounts = bids.map(b => {
                    const amount = b.bid_amount;
                    return parseFloat(amount?.toString() || '0');
                }).filter(a => a > 0); // Filter out $0 bids (initial auction start bids)

                if (amounts.length > 0) {
                    const currentBid = Math.max(...amounts);
                    setBidData({
                        currentBid,
                        totalBids: amounts.length,
                        hasBids: true,
                    });
                } else {
                    // Only $0 bids exist, auction started but no real bids yet
                    setBidData({ currentBid: 0, totalBids: 0, hasBids: true });
                }
            } else {
                setBidData({ currentBid: 0, totalBids: 0, hasBids: false });
            }
        } catch (error) {
            // If bids table doesn't exist, default to no bids
            setBidData({ currentBid: 0, totalBids: 0, hasBids: false });
        }
    };

    const loadRelatedItems = async (category: string | null, excludeId: string) => {
        try {
            const allItems = await fetchGalleryItems({
                category: category || undefined,
                limit: 10,
            });

            // Filter out current item and convert to UI format
            const related = allItems
                .filter(item => item.id !== excludeId)
                .slice(0, 8)
                .map((item) => {
                    const badges: string[] = [];
                    if (item.featured) badges.push('FEATURED');
                    if (item.author_verified) badges.push('VALIDATED');
                    if ((item.likes || 0) > 100 || (item.views || 0) > 10000) {
                        badges.push('TRENDING');
                    }
                    if (item.badges && item.badges.length > 0) {
                        badges.push(...item.badges);
                    }

                    return {
                        id: item.id,
                        title: item.title,
                        artist: item.artist || item.author_name || 'Unknown',
                        subtitle: item.subtitle,
                        imageUrl: item.image_url || item.images?.[0] || '/placeholder.svg',
                        category: item.category,
                        views: item.views || 0,
                        availableStatus: item.available_status ?? true,
                        availableLabel: item.available_label || (item.available_status ? 'Available' : 'Unavailable'),
                        badges: badges.length > 0 ? badges : undefined,
                        likes: item.likes || 0,
                        author: item.author_name ? {
                            name: item.author_name,
                            avatarUrl: item.author_avatar_url || undefined,
                            country: item.author_country || undefined,
                            verified: item.author_verified || false,
                        } : undefined,
                        actions: item.actions && item.actions.length > 0 ? item.actions : undefined,
                        date: item.date,
                        description: item.description,
                        location: item.location || item.author_country,
                    };
                });

            setRelatedItems(related);
        } catch (error) {
            console.error('Error loading related items:', error);
        }
    };

    const handleAuthorClick = () => {
        if (item?.project_id) {
            navigate(`/gallery/${item.project_id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        }
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        return `$${amount.toFixed(0)}`;
    };

    const handleAuctionClick = async () => {
        // If auction has started, anyone can view it (no login required)
        if (bidData.hasBids) {
            navigate(`/auction/${item?.id}`);
            return;
        }

        // If auction hasn't started, check if user is authenticated (only Investors can start)
        if (!user) {
            toast({
                title: 'Login Required',
                description: 'Please sign in to start auctions',
                variant: 'destructive',
            });
            navigate('/login', { state: { returnTo: `/gallery/${id}` } });
            return;
        }

        // Start the auction (only for authenticated users)
        if (item?.project_id) {
            await startAuction();
        }
    };

    const startAuction = async () => {
        if (!user || !item?.project_id) {
            return;
        }

        setStartingAuction(true);

        try {
            // Try to create an auction record or initial bid to mark auction as started
            // First, try to insert into bids table with auction_id or project_id
            const bidDataToInsert: any = {
                user_id: user.id,
                created_at: new Date().toISOString(),
            };

            // Try with auction_id first (as per PlaceBidDialog structure)
            bidDataToInsert.auction_id = item.project_id;
            bidDataToInsert.bid_amount = 0; // Starting bid is $0

            const { error: bidError } = await supabase
                .from('bids')
                .insert(bidDataToInsert);

            if (bidError) {
                // If table doesn't exist, that's okay - just navigate
                if (bidError.code === '42P01' || bidError.message?.includes('does not exist')) {
                    toast({
                        title: 'Opening Auction',
                        description: 'Redirecting to auction page...',
                    });
                } else {
                    // Other error - log and show message
                    console.error('Error starting auction:', bidError);
                    toast({
                        title: 'Notice',
                        description: 'Auction page will open. Bid functionality may require database setup.',
                    });
                }
            } else {
                toast({
                    title: 'Auction Started!',
                    description: 'The auction has been started. You can now place bids.',
                });
            }

            // Refresh bid data to update UI
            await loadBidData(item.project_id);

            // Navigate to auction page
            navigate(`/auction/${item.id}`);
        } catch (error: any) {
            console.error('Error starting auction:', error);
            toast({
                title: 'Opening Auction',
                description: 'Redirecting to auction page...',
            });
            // Even if there's an error, navigate to auction page
            navigate(`/auction/${item.id}`);
        } finally {
            setStartingAuction(false);
        }
    };

    const handlePlaceBidClick = async () => {
        // Check if user is authenticated
        if (!user) {
            toast({
                title: 'Login Required',
                description: 'Please sign in to place a bid',
                variant: 'destructive',
            });
            navigate('/login', { state: { returnTo: `/gallery/${id}` } });
            return;
        }

        // User is authenticated, proceed to auction page
        navigate(`/auction/${item?.id}`);
    };

    const handleLikeClick = async () => {
        if (!user) {
            toast({
                title: 'Login Required',
                description: 'Please sign in to like projects',
                variant: 'destructive',
            });
            navigate('/login', { state: { returnTo: `/gallery/${id}` } });
            return;
        }

        if (!item?.project_id || isLiking) {
            return;
        }

        setIsLiking(true);
        try {
            const newLikes = await toggleProjectLike(
                item.project_id,
                user.id,
                item.id.toString()
            );
            
            // Update local state
            setItem(prev => prev ? { ...prev, likes: newLikes } : null);
            setHasLiked(!hasLiked);
            
            toast({
                title: hasLiked ? 'Unliked' : 'Liked',
                description: hasLiked ? 'You unliked this project' : 'You liked this project',
            });
        } catch (error: any) {
            console.error('Error toggling like:', error);
            toast({
                title: 'Error',
                description: 'Failed to update like. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLiking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner message="Loading gallery item..." />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Item not found</h2>
                    <Link to="/gallery" className="text-[#0a3d5c] hover:underline">
                        Back to gallery
                    </Link>
                </div>
            </div>
        );
    }

    const images = item.images && item.images.length > 0 ? item.images : [item.imageUrl];
    const investmentAmount = projectData?.investment_amount 
        ? parseFloat(projectData.investment_amount.replace(/[^0-9.]/g, '')) || 0
        : 0;

    return (
        <>
            <div className="bg-white pt-4 px-6 flex flex-col gap-4 mb-8 pb-8">
                <div className="border-b border-[#0a3d5c] px-4 py-2 w-full">
                    <Link to="/gallery" className="text-sm flex gap-2" style={{ color }}>
                        <MoveLeft size={16} /> Back to gallery
                    </Link>
                </div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left - Large Image (slideshow) */}
                    <div>
                        <div className="rounded-2xl overflow-hidden shadow-lg relative">
                            {images.length > 0 && (
                                <img
                                    src={images[currentIdx]}
                                    alt={item.title}
                                    className="w-full h-[520px] object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                                    }}
                                />
                            )}

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentIdx((prev) => (prev - 1 + images.length) % images.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white z-20"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentIdx((prev) => (prev + 1) % images.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white z-20"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-3 mt-4">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIdx(idx)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden border ${currentIdx === idx ? 'ring-2 ring-[#0a3d5c]' : ''}`}
                                    >
                                        <img 
                                            src={img} 
                                            alt={`thumb-${idx}`} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right - Detail panel */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {item.badges && item.badges.map((b: string, i: number) => (
                                <span key={i} className="text-xs font-semibold bg-white px-3 py-1 rounded-full shadow-sm border" style={{ color }}>
                                    {b}
                                </span>
                            ))}
                            <div className="ml-auto">
                                <button
                                    onClick={handleLikeClick}
                                    disabled={isLiking}
                                    className={`flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                                        hasLiked ? 'text-red-500' : 'text-gray-600'
                                    }`}
                                    title={hasLiked ? 'Unlike this project' : 'Like this project'}
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} 
                                        viewBox="0 0 20 20" 
                                        fill={hasLiked ? 'currentColor' : 'none'}
                                        stroke="currentColor"
                                    >
                                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                    </svg>
                                    <span className="text-sm font-medium">{item.likes ?? 0}</span>
                                </button>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold" style={{ color }}>{item.title}</h1>
                        {item.subtitle && <p className="text-gray-600 mt-2">{item.subtitle}</p>}
                        {item.description && <p className="text-sm text-gray-500 mt-2">{item.description}</p>}

                        {item.author && (
                            <div 
                                onClick={handleAuthorClick}
                                className="mt-6 bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:bg-gray-50 transition"
                            >
                                <h4 className="text-xs font-semibold text-gray-500">INVENTOR</h4>
                                <div className="flex items-center gap-4 mt-3">
                                    {item.author.avatarUrl ? (
                                        <img 
                                            src={item.author.avatarUrl} 
                                            alt={item.author.name} 
                                            className="w-14 h-14 rounded-full object-cover border"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"%3E%3C/circle cx="12" cy="7" r="4"%3E%3C/svg%3E';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold" style={{ color }}>{item.author.name}</span>
                                            {item.author.verified && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">{item.author.country || item.location}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            {item.location && (
                                <div className="bg-white rounded-xl p-4 shadow-sm border">
                                    <h4 className="text-xs font-semibold text-gray-500">LOCATION</h4>
                                    <div className="mt-2 font-semibold">{item.location}</div>
                                </div>
                            )}
                            {item.category && (
                                <div className="bg-white rounded-xl p-4 shadow-sm border">
                                    <h4 className="text-xs font-semibold text-gray-500">CATEGORY</h4>
                                    <div className="mt-2 flex gap-2 flex-wrap">
                                        <span className="text-xs bg-gray-50 px-2 py-1 rounded-full border">{item.category}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Auction/Bidding Section */}
                        {/* Show to all users when auction has started, or to Investors when auction hasn't started */}
                        {(bidData.hasBids || user?.user_metadata?.user_type === 'Investor') && (
                            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-xs text-gray-500">CURRENT BID</div>
                                        <div className="text-xl font-bold">
                                            {bidData.hasBids ? formatCurrency(bidData.currentBid) : '$0'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">TOTAL BIDS</div>
                                        <div className="text-xl font-bold">{bidData.totalBids}</div>
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-2">
                                    {bidData.hasBids ? (
                                        // Auction has started - show "View Auction" to all users
                                        <button 
                                            onClick={handleAuctionClick}
                                            disabled={startingAuction}
                                            className="flex-1 px-4 py-2 rounded-full bg-[#0a3d5c] text-white font-medium hover:bg-[#062a3d] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            View Auction
                                        </button>
                                    ) : (
                                        // Auction hasn't started - only Investors can start it
                                        user?.user_metadata?.user_type === 'Investor' && (
                                            <button 
                                                onClick={handleAuctionClick}
                                                disabled={startingAuction}
                                                className="flex-1 px-4 py-2 rounded-full bg-[#0a3d5c] text-white font-medium hover:bg-[#062a3d] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {startingAuction ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Starting...
                                                    </>
                                                ) : (
                                                    'Start Auction'
                                                )}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Additional information section */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left: Descriptions and documents (span 2 cols on lg) */}
                <div className="lg:col-span-2 space-y-6">
                    {item.description && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="font-semibold text-lg" style={{ color }}>Project Description</h3>
                            <p className="text-sm text-gray-600 mt-3">{item.description}. Detailed project overview and value proposition are provided here to give potential investors context and rationale for interest.</p>
                        </div>
                    )}

                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 className="font-semibold text-lg" style={{ color }}>Technical Specifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                            <div>
                                <div className="text-xs text-gray-400">PATENT STATUS</div>
                                <div className="font-semibold mt-1">Patent Pending</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400">DEVELOPMENT STAGE</div>
                                <div className="font-semibold mt-1">Prototype Ready</div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">Detailed technical documentation including engineering specifications, materials analysis, performance metrics, and testing results are available to registered investors.</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 className="font-semibold text-lg" style={{ color }}>Available Documents</h3>
                        <div className="mt-4">
                            <div className="flex items-center justify-between bg-gray-50 rounded-md p-4 border">
                                <div>
                                    <div className="font-semibold">Clinical Data</div>
                                    <div className="text-xs text-gray-400">Technical brief</div>
                                </div>
                                <div className="text-xs text-gray-400">Login required</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Investment options / key facts */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h4 className="text-xs text-gray-500">Investment Options</h4>
                        <div className="mt-4 bg-gray-50 rounded-md p-4 border">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="font-semibold">Acquisition Offer</div>
                                    <div className="text-xs text-gray-500">Complete technology acquisition</div>
                                    <ul className="mt-2 text-xs text-gray-500 list-disc list-inside">
                                        <li>FDA approval support</li>
                                        <li>Manufacturing setup</li>
                                        <li>Market launch partnership</li>
                                    </ul>
                                </div>
                                <div className="font-bold">
                                    {investmentAmount > 0 
                                        ? formatCurrency(investmentAmount) 
                                        : '$25.0M'}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">Minimum Investment: USD 10,000,000</div>
                    </div>

                    {!user && (
                        <div>
                            <button 
                                onClick={() => navigate('/register')}
                                className="w-full px-4 py-3 rounded-full text-white font-medium" 
                                style={{ background: color }}
                            >
                                REGISTER TO INVEST
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-xl p-4 shadow-sm border">
                        <h4 className="text-xs text-gray-500">Key Facts</h4>
                        <div className="mt-4 text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Project ID</span>
                                <span className="font-semibold">PROJ-{String(item.id).slice(0, 8)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Status</span>
                                <span className="font-semibold">In Auction</span>
                            </div>
                            {item.category && (
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Category</span>
                                    <span className="font-semibold">{item.category}</span>
                                </div>
                            )}
                            {item.date && (
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Listed</span>
                                    <span className="font-semibold">{item.date}</span>
                                </div>
                            )}
                            {/* Auction link - Visible to all users when auction has started */}
                            {bidData.hasBids && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-500">Auction</span>
                                    <button 
                                        onClick={handleAuctionClick}
                                        className="font-semibold text-[#0a3d5c] hover:underline flex items-center gap-1"
                                    >
                                        View Live Auction →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border">
                        <h4 className="text-xs text-gray-500">Share Project</h4>
                        <div className="mt-3 flex gap-3">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast({
                                        title: 'Copied!',
                                        description: 'Project link copied to clipboard',
                                    });
                                }}
                                className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center hover:bg-gray-100 transition"
                            >
                                <Share2 size={16} className="text-gray-600" />
                            </button>
                            <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center hover:bg-gray-100 transition">
                                <span className="text-sm">🐦</span>
                            </button>
                            <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center hover:bg-gray-100 transition">
                                <span className="text-sm">📘</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Gallery */}
            {relatedItems.length > 0 && (
                <div className="max-w-7xl mx-auto mt-8 mb-12">
                    <h2 className="text-2xl font-semibold" style={{ color }}>Similar Gallery</h2>
                    <p className="text-sm text-gray-500 mt-2 mb-3">Explore related items you might be interested in.</p>
                    <div className="flex gap-4 w-full overflow-x-auto custom-scrollbar min-h-[500px]">
                        {relatedItems.map(g => (
                            <div key={g.id} className='min-w-[300px]'>
                                <GalleryCard {...g} onClick={() => navigate(`/gallery/${g.id}`)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default GalleryDetail;
