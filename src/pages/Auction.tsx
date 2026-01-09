import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Share2, ThumbsUp, MoveLeft } from "lucide-react";
import { PlaceBidDialog } from '@/components/PlaceBidDialog';
import { supabase } from '@/lib/supabase';
import { fetchGalleryItemById, type GalleryItem } from '@/lib/projects';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function Slideshow({ galleryItem, slides }: { galleryItem: any; slides: string[] }) {
    const [index, setIndex] = useState(0);
    // Initialize with a stable default size
    const [displaySize, setDisplaySize] = useState<{ w: number; h: number }>({ w: 800, h: 500 });
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasWrapRef = useRef<HTMLDivElement | null>(null);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false);

    if (!slides || slides.length === 0) {
        return null;
    }

    const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
    const next = () => setIndex((i) => (i + 1) % slides.length);

    // Get item name for caption
    const itemName = galleryItem?.title || 'Product';
    const itemDescription = galleryItem?.description || 'High-end investment product';

    useEffect(() => {
        const el = canvasWrapRef.current;
        if (!el) return;

        const calculateSize = () => {
            // Clear any pending timeout
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }

            // Debounce resize calculations
            resizeTimeoutRef.current = setTimeout(() => {
                requestAnimationFrame(() => {
                    if (!el) return;
                    
                    const clientWidth = el.clientWidth;
                    const clientHeight = el.clientHeight;
                    
                    const viewportW = typeof window !== "undefined" ? window.innerWidth : 0;
                    
                    // Ensure we have a valid width (at least 100px to avoid tiny sizes)
                    if (clientWidth < 100) {
                        // If width is too small, wait a bit and retry
                        setTimeout(calculateSize, 100);
                        return;
                    }

                    // Keep desktop (>1221px) behavior unchanged (cap at 800),
                    // but allow smoother scaling up to tablet widths (<1222px).
                    const maxW = viewportW > 0 && viewportW < 1222 ? 1100 : 800;
                    // Responsive minimum width: smaller for mobile, reasonable for desktop
                    // Use percentage-based minimum to maintain responsiveness
                    const minWidth = viewportW > 640 ? Math.max(280, Math.floor(clientWidth * 0.5)) : Math.max(200, Math.floor(clientWidth * 0.6));
                    // Use actual clientWidth, but ensure it meets minimum requirements and doesn't exceed max
                    const calculatedWidth = Math.min(maxW, Math.max(minWidth, Math.floor(clientWidth)));
                    const calculatedHeight = Math.round(calculatedWidth * (500 / 800));
                    
                    setDisplaySize(prev => {
                        // Only update if there's a meaningful change (at least 20px difference to prevent flicker)
                        const widthDiff = Math.abs(prev.w - calculatedWidth);
                        const heightDiff = Math.abs(prev.h - calculatedHeight);
                        
                        if (widthDiff < 20 && heightDiff < 20 && isInitializedRef.current) {
                            return prev;
                        }
                        isInitializedRef.current = true;
                        return { w: calculatedWidth, h: calculatedHeight };
                    });
                });
            }, 150); // Debounce delay
        };

        const ro = new ResizeObserver(() => {
            calculateSize();
        });

        // Initial calculation with a slight delay to ensure layout is complete
        const initTimeout = setTimeout(() => {
            calculateSize();
        }, 100);
        
        ro.observe(el);
        return () => {
            ro.disconnect();
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            clearTimeout(initTimeout);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Use displaySize directly (it already has proper min/max constraints)
        // Only enforce a very small absolute minimum to prevent rendering errors
        const absoluteMinW = 200;
        const absoluteMinH = 125;
        const W = Math.max(displaySize.w, absoluteMinW);
        const H = Math.max(displaySize.h, absoluteMinH);

        const img = new Image();
        img.src = slides[index];

        img.onload = () => {
            const X = 0;
            const Y = 0;

            const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            canvas.style.width = `${W}px`;
            canvas.style.height = `${H}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, W, H);

            const curveStrength = 0.5; // 0 = no curve, 1 = very curved
            const borderCurve = Math.max(60, Math.round(H * 0.2));
            const verticalStretch = Math.round(H * 0.4);

            // Reduce work on small screens to keep it smooth.
            const steps = Math.min(1600, Math.max(450, Math.floor(W * 2)));
            const sliceW = img.width / steps;

            for (let i = 0; i < steps; i++) {
                const t = i / (steps - 1);
                const curve = Math.cos((t - 0.5) * Math.PI) * curveStrength;

                const targetHeight = H - curve * verticalStretch;
                const targetY = Y + (H - targetHeight) / 2;

                ctx.drawImage(
                    img,
                    i * sliceW, 0, sliceW, img.height,
                    X + t * W, targetY, sliceW * (W / img.width), targetHeight
                );
            }

            // Curved border
            ctx.save();
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 5;

            ctx.beginPath();
            ctx.moveTo(X + 3, Y + 3);

            ctx.quadraticCurveTo(
                X + W / 2,
                Y + borderCurve - 10,
                X + W - 3,
                Y + 3
            );

            ctx.lineTo(X + W - 3, Y + H - 3);

            ctx.quadraticCurveTo(
                X + W / 2,
                Y + H - borderCurve + 10,
                X + 3,
                Y + H - 3
            );

            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        };
    }, [displaySize.h, displaySize.w, index, slides]);

    return (
        <div className="w-full flex flex-col items-center gap-6 max-[1221px]:gap-4 max-[640px]:gap-3">
            {/* 3D Frame Container */}
            <div className="w-full px-4 max-[640px]:px-2">
                {/* Main image container with side borders */}
                <div className="relative bg-gradient-to-b rounded-3xl flex flex-col items-center">
                    {/* Image */}
                    <div
                        ref={canvasWrapRef}
                        className="relative rounded-2xl overflow-visible z-1 w-full flex justify-center max-[480px]:px-1"
                        style={{
                            filter: "drop-shadow(0 40px 40px rgba(0, 0, 0, 0.6)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4))"
                        }}
                    >
                        {/* <img
                            src={slides[index]}
                            alt={`slide-${index}`}
                            className="w-full  object-contain bg-gray-100"
                        /> */}
                        <canvas ref={canvasRef} id="screen" />
                        {/* Navigation Arrows - Positioned on sides of image */}
                        {slides.length > 1 && (
                            <>
                                <button
                                    onClick={prev}
                                    aria-label="previous"
                                    className="absolute -left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-full p-3 shadow-lg hover:shadow-xl transition-all text-2xl font-bold w-12 h-12 flex items-center justify-center z-10 max-[640px]:-left-3 max-[640px]:w-10 max-[640px]:h-10 max-[640px]:text-xl"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={next}
                                    aria-label="next"
                                    className="absolute -right-4 top-1/2 -translate-y-1/2 bg-gradient-to-l from-yellow-400 to-yellow-600 text-black rounded-full p-3 shadow-lg hover:shadow-xl transition-all text-2xl font-bold w-12 h-12 flex items-center justify-center max-[640px]:-right-2 max-[640px]:w-10 max-[640px]:h-10 max-[640px]:text-xl"
                                >
                                    ›
                                </button>
                            </>
                        )}
                        <div className='absolute right-5 top-10 items-center justify-center flex gap-2 max-[1221px]:right-3 max-[1221px]:top-3'>
                            <button className='flex items-center gap-2 px-4 py-2 rounded-full bg-[#ffffffe0] border-[#877c63] border hover:bg-gray-100 transition-all text-gray-700 font-medium max-[480px]:px-3 max-[480px]:py-1.5 max-[480px]:text-xs'>
                                <Share2 size={12} />
                                Share
                            </button>
                            <button className='flex items-center justify-center w-8 h-8 rounded-full bg-[#d5b775] hover:bg-[#c5a665] transition-all shadow-md max-[640px]:w-7 max-[640px]:h-7'>
                                <ThumbsUp size={12} className="text-white" fill="white" />
                            </button>
                        </div>

                        <div className="mt-3 w-full flex gap-2 z-20 min-[1222px]:absolute min-[1222px]:left-10 min-[1222px]:top-1/2 min-[1222px]:-translate-y-1/2 min-[1222px]:mt-0 min-[1222px]:w-12 min-[1222px]:flex-col min-[1222px]:justify-start max-[1221px]:absolute max-[1221px]:left-10 max-[1221px]:top-1/2 max-[1221px]:-translate-y-1/2 max-[1221px]:mt-0 max-[1221px]:w-10 max-[1221px]:flex-col max-[1221px]:justify-start max-[1221px]:gap-2 max-[640px]:left-8 max-[640px]:w-9 max-[640px]:gap-1.5">
                            {slides.length > 1 && (
                                slides.map((s, i) => (
                                    <div key={i} className='w-12 h-12 max-[1221px]:w-10 max-[1221px]:h-10 max-[640px]:w-9 max-[640px]:h-9' style={{
                                        font: "26px Monaco, MonoSpace",
                                    }}>
                                        <button
                                            onClick={() => setIndex(i)}
                                            className={`w-12 h-12 rounded-lg overflow-hidden border shadow-lg transition-all max-[1221px]:w-10 max-[1221px]:h-10 max-[640px]:w-9 max-[640px]:h-9 ${i === index ? 'border-yellow-400 ring-2 ring-yellow-400 scale-105' : 'border-gray-400'
                                                }`}
                                        >
                                            <img src={s} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        {/* Caption Text */}
                        <div className="text-center max-w-xl px-4">
                            <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-400 max-[640px]:text-sm">
                                Neutron25, anti-stress, anti-anxiety,
                            </p>
                            <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-400 max-[640px]:text-sm">
                                Anti panic attacks
                            </p>
                        </div>

                        {/* Advertisement Banner */}
                        <div className="max-w-2xl mt-1 max-[480px]:hidden">
                            <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 rounded-lg border-2 border-teal-700 shadow-xl overflow-hidden relative">
                                <div className="relative z-10 flex items-center">
                                    <div className="flex-1">
                                        <img src='/assets/ad.png' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

const color = '#0a3d5c';
const flags = [
    '/assets/flags/BR.png',
    '/assets/flags/CN.png',
    '/assets/flags/DE.png',
    '/assets/flags/FR.png',
    '/assets/flags/ES.png',
    '/assets/flags/JP.png',
    '/assets/flags/RU.png',
    '/assets/flags/US.png'
];

const Auction: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [galleryItem, setGalleryItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bidData, setBidData] = useState<{ currentBid: number; totalBids: number; hasBids: boolean }>({ 
        currentBid: 0, 
        totalBids: 0, 
        hasBids: false 
    });
    const [currentBidders, setCurrentBidders] = useState<any[]>([]); // Recent bidders (left panel)
    const [competingBids, setCompetingBids] = useState<any[]>([]); // Bids sorted by amount (right panel)
    const [startingAuction, setStartingAuction] = useState(false);

    useEffect(() => {
        if (id) {
            loadAuctionData();
        }
    }, [id]);

    const loadAuctionData = async () => {
        try {
            setLoading(true);
            
            if (!id) {
                navigate('/gallery');
                return;
            }

            // Fetch gallery item from database
            const item = await fetchGalleryItemById(id);
            
            if (!item) {
                toast({
                    title: 'Not Found',
                    description: 'Auction item not found or not yet approved',
                    variant: 'destructive',
                });
                navigate('/gallery');
                return;
            }

            setGalleryItem(item);

            // Fetch bid data
            await loadBidData(item.project_id);
        } catch (error: any) {
            console.error('Error loading auction data:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to load auction data',
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
                setCurrentBidders([]);
                setCompetingBids([]);
                return;
            }

            // Try to fetch bids from database
            // Use auction_id only (project_id doesn't exist in bids table)
            const { data: bids, error } = await supabase
                .from('bids')
                .select(`
                    bid_amount,
                    user_id,
                    created_at,
                    auction_id,
                    users!bids_user_id_fkey (
                        id,
                        full_name,
                        photo_url,
                        country
                    )
                `)
                .eq('auction_id', projectId)
                .order('created_at', { ascending: false }); // Get all bids ordered by most recent first

            if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
                console.error('Error fetching bids:', error);
            }

            if (bids && bids.length > 0) {
                // Check if auction has started (any bid exists, even $0)
                // Filter out $0 bids for display, but mark auction as started
                const realBids = bids.filter(b => {
                    const amount = parseFloat((b.bid_amount || '0').toString());
                    return amount > 0;
                });

                // If there are any bids (even $0), auction has started
                if (bids.length > 0) {
                    const currentBid = Math.max(...realBids.map(b => 
                        parseFloat((b.bid_amount || '0').toString())
                    ));

                    // Get bidders with user info
                    // Handle users as array or single object
                    const biddersList = realBids.map(b => {
                        const user = Array.isArray(b.users) ? b.users[0] : b.users;
                        return {
                            name: user?.full_name || 'Anonymous',
                            avatar: user?.photo_url || '/placeholder.svg',
                            amount: `$${parseFloat((b.bid_amount || '0').toString()).toLocaleString()}`,
                            country: user?.country || 'Unknown',
                            userId: b.user_id,
                            bidAmount: parseFloat((b.bid_amount || '0').toString()),
                            createdAt: b.created_at,
                        };
                    });

                    // Left panel: Current Bidders (recent bidders, ordered by created_at desc)
                    const recentBidders = [...biddersList].sort((a, b) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );

                    // Right panel: Competing Bids (sorted by bid amount desc - highest first)
                    const competingBidsList = [...biddersList].sort((a, b) => 
                        b.bidAmount - a.bidAmount
                    );

                    setBidData({
                        currentBid,
                        totalBids: realBids.length,
                        hasBids: true,
                    });
                    setCurrentBidders(recentBidders);
                    setCompetingBids(competingBidsList);
                } else {
                    // Only $0 bids exist, auction started but no real bids yet
                    // Still mark as started so UI shows auction structure
                    setBidData({ currentBid: 0, totalBids: 0, hasBids: true });
                    setCurrentBidders([]);
                    setCompetingBids([]);
                }
            } else {
                // No bids at all - auction not started
                setBidData({ currentBid: 0, totalBids: 0, hasBids: false });
                setCurrentBidders([]);
                setCompetingBids([]);
            }
        } catch (error) {
            setBidData({ currentBid: 0, totalBids: 0, hasBids: false });
            setCurrentBidders([]);
            setCompetingBids([]);
        }
    };

    const handleStartAuction = async () => {
        if (!user) {
            toast({
                title: 'Login Required',
                description: 'Please sign in to start the auction',
                variant: 'destructive',
            });
            navigate('/login', { state: { returnTo: `/auction/${id}` } });
            return;
        }

        if (!galleryItem?.project_id) {
            toast({
                title: 'Error',
                description: 'Cannot start auction: Project ID missing',
                variant: 'destructive',
            });
            return;
        }

        setStartingAuction(true);

        try {
            // Create initial auction record
            const bidDataToInsert: any = {
                user_id: user.id,
                created_at: new Date().toISOString(),
                auction_id: galleryItem.project_id,
                bid_amount: 0,
            };

            const { error: bidError } = await supabase
                .from('bids')
                .insert(bidDataToInsert);

            if (bidError) {
                // If auction_id doesn't work, the table structure might be different
                // Log the error for debugging
                console.error('Error inserting bid with auction_id:', bidError);
                
                // If table doesn't exist, that's okay - just continue
                if (bidError.code === '42P01' || bidError.message?.includes('does not exist')) {
                    // Table doesn't exist - that's okay, just navigate
                    toast({
                        title: 'Opening Auction',
                        description: 'Redirecting to auction page...',
                    });
                } else {
                    // Other error - throw it
                    throw bidError;
                }
            }

            // Refresh bid data first to update UI state
            await loadBidData(galleryItem.project_id);

            // Show success message
            toast({
                title: 'Auction Started!',
                description: 'The auction has been started. You can now place bids.',
            });
        } catch (error: any) {
            console.error('Error starting auction:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to start auction',
                variant: 'destructive',
            });
        } finally {
            setStartingAuction(false);
        }
    };

    // Helper function to find user or investor by name and navigate to their profile
    const handleBidderClick = (userId?: string) => {
        if (userId) {
            navigate(`/user/${userId}`);
        }
    };

    // Handle clicking on the product/slideshow - navigate to seller's profile
    const handleProductClick = () => {
        if (galleryItem?.project_id) {
            navigate(`/gallery/${galleryItem.id}`);
        }
    };

    // Countdown state (start from 72 hours)
    const [secondsLeft, setSecondsLeft] = useState<number>(72 * 3600);
    
    // Place Bid Dialog state
    const [bidDialogOpen, setBidDialogOpen] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft(s => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatCountdown = (s: number) => {
        const hours = Math.floor(s / 3600);
        const minutes = Math.floor((s % 3600) / 60);
        const seconds = s % 60;
        return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        }
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        return `$${amount.toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner message="Loading auction..." />
            </div>
        );
    }

    if (!galleryItem) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Auction item not found</h2>
                    <Link to="/gallery" className="text-[#0a3d5c] hover:underline">
                        Back to gallery
                    </Link>
                </div>
            </div>
        );
    }

    // Prepare images for slideshow
    const slides = galleryItem.images && galleryItem.images.length > 0 
        ? galleryItem.images 
        : galleryItem.image_url 
        ? [galleryItem.image_url] 
        : ['/placeholder.svg'];

    // Highest bidder (from competing bids - highest amount)
    const topBidder = competingBids.length > 0 ? competingBids[0] : null;

    return (
        <div className="relative min-h-screen pt-20 pb-16">
            {/* Back to gallery link */}
            <div className="relative z-20 px-4 pt-4">
                <Link to="/gallery" className="text-white hover:text-yellow-300 flex items-center gap-2 text-sm">
                    <MoveLeft size={16} /> Back to gallery
                </Link>
            </div>

            {/* Use an img tag instead of CSS background-image so it works on mobile */}
            <img src="/assets/auction-back.png" alt="Auction background" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            {/* subtle overlay to ensure foreground legibility */}
            <div className="absolute inset-0 bg-transparent pointer-events-none" />

            <div className="relative z-10 2xl:mt-0 min-[1222px]:-mt-40 max-w-8xl mx-auto h-full 2xl:scale-100 min-[1222px]:scale-75 max-[1221px]:px-3">
                <div className="flex flex-col gap-6 w-full justify-center items-center">
                    {/* Top Leading Bidder Card - Only show if auction has started and has bids */}
                    {topBidder && (
                        <div className='relative flex items-start justify-center gap-3 w-full pt-8 px-4'>
                            <div className="w-full flex justify-center flex-col items-center mb-2 max-w-4xl">
                                <div 
                                    onClick={() => topBidder.userId && navigate(`/user/${topBidder.userId}`)}
                                    className="flex relative h-full items-center gap-3 bg-gray-800/75 p-3 rounded-2xl border transition-all ring-2 ring-yellow-400 border-yellow-400 shadow-2xl shadow-yellow-400/50 w-full max-w-[600px] cursor-pointer hover:bg-gray-800/85 overflow-hidden" 
                                    style={{ boxShadow: "0px 20px 30px 10px #00000050" }}
                                >
                                    <div className="relative flex-shrink-0 shadow-lg rounded-full w-20 h-20 p-2 max-[1221px]:w-16 max-[1221px]:h-16 max-[1221px]:p-1.5" style={{ backgroundImage: "url('/assets/auction/background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                        <img src={topBidder.avatar} alt={topBidder.name} className="w-full h-full rounded-full object-cover" onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                                        }} />
                                    </div>
                                    <div className='flex flex-col justify-center flex-1 min-w-0'>
                                        <div className="text-lg font-bold text-white max-[1221px]:text-base truncate">{topBidder.name}</div>
                                        <div className='text-sm font-medium text-yellow-300/70 mt-1 max-[1221px]:text-xs max-[1221px]:mt-0 truncate'>{topBidder.country}</div>
                                    </div>
                                    <div className="text-right flex flex-col items-end h-full justify-center flex-shrink-0">
                                        <div className="text-2xl font-bold text-[#d5b775] max-[1221px]:text-lg whitespace-nowrap">{formatCurrency(bidData.currentBid)}</div>
                                    </div>
                                    <img src='/assets/auction/percent.png' width={30} height={30} className="absolute top-2 right-2 flex-shrink-0" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Start Auction Message - Show if auction hasn't started */}
                    {!bidData.hasBids && (
                        <div className="w-full max-w-2xl mx-auto px-4 pt-8">
                            <div className="bg-gray-800/90 text-white rounded-xl p-6 border border-yellow-400/50 shadow-lg text-center">
                                <h2 className="text-2xl font-bold mb-4">Auction Not Started</h2>
                                <p className="text-gray-300 mb-6">This auction hasn't started yet. Be the first to start it!</p>
                                {user ? (
                                    <button 
                                        onClick={handleStartAuction}
                                        disabled={startingAuction}
                                        className="px-6 py-3 rounded-full bg-[#0a3d5c] text-white font-semibold hover:bg-[#062a3d] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                                    >
                                        {startingAuction ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Starting Auction...
                                            </>
                                        ) : (
                                            'Start Auction'
                                        )}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => navigate('/login', { state: { returnTo: `/auction/${id}` } })}
                                        className="px-6 py-3 rounded-full bg-[#0a3d5c] text-white font-semibold hover:bg-[#062a3d] transition-all"
                                    >
                                        Sign In to Start Auction
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Auction Structure - Show when auction has started (even if no bids yet) */}
                    {bidData.hasBids && (
                        <div className='flex relative max-[1221px]:w-full max-[1221px]:flex-col max-[1221px]:items-center max-[1221px]:gap-6 max-[640px]:gap-4'>
                            {/* Left bidders */}
                            <div className="w-full flex flex-col relative gap-8 min-[1222px]:min-w-[380px] min-[1222px]:-top-8 min-[1222px]:[perspective:1000px] max-[1221px]:max-w-none max-[1221px]:gap-4">
                                <div className="w-full bg-gray-800/75 text-white rounded-xl p-4 border border-white/10 shadow-lg min-[1222px]:[transform:rotateY(20deg)] min-[1222px]:shadow-[-45px_45px_15px_0px_#00000050] max-[1221px]:p-3 max-[640px]:p-2">
                                    <div className="text-sm font-semibold mb-3 max-[480px]:text-xs max-[480px]:mb-2">Current Bidders</div>
                                    <div className="space-y-3">
                                        {currentBidders.length > 0 ? (
                                            currentBidders.map((b, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => handleBidderClick(b.userId)}
                                                    className={`flex relative h-full w-full items-center gap-3 bg-gray-800/75 p-3 rounded-2xl border transition-all cursor-pointer hover:bg-gray-800/90 max-[1221px]:gap-2 max-[1221px]:p-2 max-[1221px]:rounded-xl overflow-hidden ${i === 0 ? 'ring-2 ring-yellow-400 border-yellow-400 shadow-2xl shadow-yellow-400/50' : ''}`}
                                                    title="Click to view profile"
                                                >
                                                    <div className="relative flex-shrink-0 shadow-lg rounded-full w-20 h-20 p-2 max-[1221px]:w-16 max-[1221px]:h-16 max-[1221px]:p-1.5 max-[640px]:w-14 max-[640px]:h-14 max-[640px]:p-1" style={{ backgroundImage: "url('/assets/auction/background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                                        <img src={b.avatar} alt={b.name} className="w-full h-full rounded-full object-cover" onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                                                        }} />
                                                    </div>
                                                    <div className='flex flex-col justify-center flex-1 min-w-0'>
                                                        <div className="text-lg font-bold text-white max-[1221px]:text-base max-[640px]:text-sm truncate">{b.name}</div>
                                                        <div className='text-sm font-medium text-yellow-300/70 mt-1 max-[640px]:hidden truncate'>{b.country}</div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end h-full justify-center flex-shrink-0">
                                                        <div className="text-2xl font-bold text-[#d5b775] max-[1221px]:text-lg max-[640px]:text-base whitespace-nowrap">{b.amount}</div>
                                                    </div>
                                                    <img src='/assets/auction/percent.png' width={30} height={30} className="absolute top-2 right-2 flex-shrink-0" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-gray-400 py-8">
                                                <p>No bidders yet</p>
                                                <p className="text-sm mt-2">Be the first to place a bid!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            {/* Countdown below leading bid box */}
                            <div className="mt-2 rounded-full justify-center px-4 py-2 text-white items-center flex gap-2" style={{ background: color }}>
                                <div className="text-lg uppercase max-[1221px]:text-sm max-[640px]:text-xs">Time Remaining: </div>
                                <div className="font-semibold text-md max-[1221px]:text-sm max-[640px]:text-xs">{formatCountdown(secondsLeft)}</div>
                            </div>
                            {/* <button onClick={() => navigate('/')} className="px-4 py-2 rounded-full bg-white/10 text-white border text-sm md:text-base">Go To Back</button> */}
                        </div>

                        {/* Center image - moved lower and smaller */}
                        <div className="w-full min-[1222px]:min-w-2/5 flex flex-col items-center justify-between gap-8 md:gap-24 max-[1221px]:max-w-none max-[1221px]:gap-4">
                            {/* Leading bid box - use main color */}
                            <div className="mt-6 w-full flex flex-col items-center max-[1221px]:mt-2">

                                {/* Slideshow: use gallery images - Clickable to go to gallery detail */}
                                <div 
                                    className="w-full flex justify-center cursor-pointer"
                                    onClick={handleProductClick}
                                    title="Click to view project details"
                                >
                                    <Slideshow galleryItem={galleryItem} slides={slides} />
                                </div>
                            </div>
                        </div>

                            {/* Right bidders - Competing Bids (sorted by highest amount) */}
                            <div className="w-full flex flex-col relative gap-8 min-[1222px]:min-w-[380px] min-[1222px]:-top-8 min-[1222px]:[perspective:1000px] max-[1221px]:max-w-none max-[1221px]:gap-4">
                                <div className="w-full bg-gray-800/75 text-white rounded-xl p-4 border border-white/10 drop-shadow-2xl shadow-lg min-[1222px]:[transform:rotateY(-20deg)] min-[1222px]:shadow-[45px_45px_15px_0px_#00000050] max-[1221px]:p-3 max-[640px]:p-2">
                                    <div className="text-sm font-semibold mb-3 max-[480px]:text-xs max-[480px]:mb-2">Competing Bids</div>
                                    <div className="space-y-3">
                                        {competingBids.length > 0 ? (
                                            competingBids.map((b, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => handleBidderClick(b.userId)}
                                                    className={`flex relative h-full w-full items-center gap-3 bg-gray-800/75 p-3 rounded-2xl border transition-all cursor-pointer hover:bg-gray-800/90 max-[1221px]:gap-2 max-[1221px]:p-2 max-[1221px]:rounded-xl overflow-hidden ${i === 0 ? 'ring-2 ring-yellow-400 border-yellow-400 shadow-2xl shadow-yellow-400/50' : ''}`}
                                                    title="Click to view profile"
                                                >
                                                    <div className="text-right flex flex-col items-end h-full justify-center flex-shrink-0">
                                                        <div className="text-2xl font-bold text-[#d5b775] max-[1221px]:text-lg max-[640px]:text-base whitespace-nowrap">{b.amount}</div>
                                                    </div>
                                                    <div className='flex flex-col justify-center items-end flex-1 min-w-0'>
                                                        <div className="text-lg font-bold text-white max-[1221px]:text-base max-[640px]:text-sm truncate">{b.name}</div>
                                                        <div className='text-sm font-medium text-yellow-300/70 mt-1 max-[640px]:hidden truncate'>{b.country}</div>
                                                    </div>
                                                    <div className="relative flex-shrink-0 shadow-lg rounded-full w-20 h-20 p-2 max-[1221px]:w-16 max-[1221px]:h-16 max-[1221px]:p-1.5 max-[640px]:w-14 max-[640px]:h-14 max-[640px]:p-1" style={{ backgroundImage: "url('/assets/auction/background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                                        <img src={b.avatar} alt={b.name} className="w-full h-full rounded-full object-cover" onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                                                        }} />
                                                    </div>
                                                    <img src='/assets/auction/percent.png' width={30} height={30} className="absolute top-2 left-2 flex-shrink-0" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-gray-400 py-8">
                                                <p>No competing bids yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {bidData.hasBids && (
                                    <button 
                                        onClick={() => {
                                            if (!user) {
                                                toast({
                                                    title: 'Login Required',
                                                    description: 'Please sign in to place a bid',
                                                    variant: 'destructive',
                                                });
                                                navigate('/login', { state: { returnTo: `/auction/${id}` } });
                                                return;
                                            }
                                            setBidDialogOpen(true);
                                        }} 
                                        className="px-4 py-2 md:px-6 md:py-3 rounded-full text-white font-semibold max-[1221px]:py-2 max-[1221px]:text-sm" 
                                        style={{ background: color }}
                                    >
                                        Place Bid
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Place Bid Dialog */}
            {bidData.hasBids && (
                <PlaceBidDialog
                    open={bidDialogOpen}
                    onOpenChange={setBidDialogOpen}
                    auctionId={galleryItem?.project_id || id || ''}
                    currentBid={bidData.currentBid}
                    itemName={galleryItem?.title || 'Auction Item'}
                    itemImage={galleryItem?.image_url || galleryItem?.images?.[0]}
                    minimumIncrement={5000}
                />
            )}
        </div>
    );
};

export default Auction;
