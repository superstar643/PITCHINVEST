import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import galleryItems from '@/lib/galleryData';
import users from '@/lib/usersData';
import investers from '@/lib/investersData';
import { Share2, ThumbsUp } from "lucide-react";
import { PlaceBidDialog } from '@/components/PlaceBidDialog';

function Slideshow({ galleryItem, userItem, isUser }: { galleryItem: any; userItem: any; isUser: boolean }) {
    const [index, setIndex] = useState(0);
    // Initialize with a stable default size
    const [displaySize, setDisplaySize] = useState<{ w: number; h: number }>({ w: 800, h: 500 });
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasWrapRef = useRef<HTMLDivElement | null>(null);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false);


    const slides = ['https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424875670_34d29b62.webp',
        'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424892143_226da278.webp',
        'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424877564_1c4de7e1.webp',
        'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424894040_22858759.webp',
        'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424879610_fe654cb4.webp',
        'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424895967_0c1546e3.webp']

    if (!slides || slides.length === 0) {
        return null;
    }

    const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
    const next = () => setIndex((i) => (i + 1) % slides.length);

    // Get item name for caption
    const itemName = isUser ? (userItem as any).fullName : (galleryItem as any).title || 'Product';
    const itemDescription = isUser ? 'Premium Quality Product' : (galleryItem as any).description || 'High-end investment product';

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
    const { id } = useParams();
    const navigate = useNavigate();

    const galleryItem = galleryItems.find(g => String(g.id) === id);
    const userItem = users.find(u => String(u.id) === id);
    const item = galleryItem ?? userItem;
    const isUser = !!userItem && !galleryItem;

    // Helper function to find user or investor by name and navigate to their profile
    const handleBidderClick = (bidderName: string) => {
        // Try to find in users first
        const matchedUser = users.find(u => 
            u.fullName.toLowerCase().includes(bidderName.toLowerCase()) || 
            bidderName.toLowerCase().includes(u.fullName.toLowerCase())
        );
        
        if (matchedUser && matchedUser.id) {
            navigate(`/user/${matchedUser.id}`);
            return;
        }

        // Try to find in investors
        const matchedInvestor = investers.find(inv => 
            inv.name.toLowerCase().includes(bidderName.toLowerCase()) || 
            bidderName.toLowerCase().includes(inv.name.toLowerCase())
        );
        
        if (matchedInvestor && matchedInvestor.id) {
            navigate(`/investor/${matchedInvestor.id}`);
            return;
        }

        // If no match found, could show a toast or do nothing
        console.log(`No profile found for bidder: ${bidderName}`);
    };

    // Handle clicking on the product/slideshow - navigate to seller's profile
    const handleProductClick = () => {
        if (userItem && userItem.id) {
            navigate(`/user/${userItem.id}`);
        } else if (galleryItem && galleryItem.author) {
            // Try to find user by author name
            const matchedUser = users.find(u => 
                u.fullName.toLowerCase().includes(galleryItem.author?.name.toLowerCase() || '') || 
                galleryItem.author?.name.toLowerCase().includes(u.fullName.toLowerCase() || '')
            );
            if (matchedUser && matchedUser.id) {
                navigate(`/user/${matchedUser.id}`);
            }
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

    if (!item) {
        return (
            <div className="min-h-screen flex items-center justify-center">Auction item not found</div>
        );
    }

    // sample bidders (left = current bidders, right = competing bids)
    const leftBidders = [
        { name: 'Haico', avatar: '/assets/1.avif', amount: '$317,548' },
        { name: 'Ben', avatar: '/assets/2.avif', amount: '$314,914' },
        { name: 'Tony', avatar: '/assets/3.avif', amount: '$281,699' },
        { name: 'Jason', avatar: '/assets/4.avif', amount: '$261,238' },
        { name: 'Marie', avatar: '/assets/5.avif', amount: '$260,739' },
    ];

    const rightBidders = [
        { name: 'Pedro', avatar: '/assets/6.avif', amount: '$250,789' },
        { name: 'Carlos', avatar: '/assets/1.avif', amount: '$247,898' },
        { name: 'Zulu', avatar: '/assets/2.avif', amount: '$237,667' },
        { name: 'Styven', avatar: '/assets/3.avif', amount: '$224,650' },
        { name: 'Jack', avatar: '/assets/4.avif', amount: '$173,260' },
    ];

    return (
        <div className="relative min-h-screen pt-20 pb-16">
            {/* Use an img tag instead of CSS background-image so it works on mobile */}
            <img src="/assets/auction-back.png" alt="Auction background" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            {/* subtle overlay to ensure foreground legibility */}
            <div className="absolute inset-0 bg-transparent pointer-events-none" />

            <div className="relative z-10 2xl:mt-0 min-[1222px]:-mt-40 max-w-8xl mx-auto h-full 2xl:scale-100 min-[1222px]:scale-75 max-[1221px]:px-3">
                <div className="flex flex-col gap-6 w-full justify-center items-center">
                    <div className='relative flex items-start justify-center gap-3 w-full pt-8'>
                        <div className="w-full flex justify-center flex-col items-center mb-2">
                            <div 
                                onClick={() => userItem && navigate(`/user/${userItem.id}`)}
                                className={`flex relative h-full items-center gap-4 bg-gray-800/75 p-2 rounded-2xl border transition-all ring-2 ring-yellow-400 border-yellow-400 shadow-2xl shadow-yellow-400/50 max-[1221px]:w-full max-[1221px]:max-w-[clamp(320px,92vw,1221px)] max-[1221px]:mx-auto max-[1221px]:gap-3 max-[1221px]:p-2 cursor-pointer hover:bg-gray-800/85`} 
                                style={{ boxShadow: "0px 20px 30px 10px #00000050" }}
                            >
                                <div className="relative flex-shrink-0 shadow-lg rounded-full w-20 h-20 p-2 max-[1221px]:w-14 max-[1221px]:h-14 max-[1221px]:p-1.5" style={{ backgroundImage: "url('/assets/auction/background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                    <img src={userItem.photo} alt={userItem.fullName} className="w-18 h-18 rounded-full object-cover max-[1221px]:w-12 max-[1221px]:h-12" />
                                </div>
                                <div className='flex flex-col justify-center flex-1'>
                                    <div className="text-lg font-bold text-white max-[1221px]:text-base">{userItem.fullName}</div>
                                    <div className='text-sm font-medium text-yellow-300/70 mt-1 max-[1221px]:text-xs max-[1221px]:mt-0'>Warsaw</div>
                                    <div className='text-md font-medium text-gray-300 flex gap-2 max-[1221px]:text-xs'>Portugal
                                        <img src={flags[0]} alt='Flag' className='w-6 h-4 rounded mt-1 object-cover shadow-md' />
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end h-full mt-4 max-[1221px]:mt-0">
                                    <div className="text-2xl font-bold text-[#d5b775] max-[1221px]:text-lg">$317,548</div>
                                </div>
                                <img src='/assets/auction/percent.png' width={30} height={30} className="absolute top-2 right-2" />
                            </div>
                        </div>
                    </div>
                    <div className='flex relative max-[1221px]:w-full max-[1221px]:flex-col max-[1221px]:items-center max-[1221px]:gap-6 max-[640px]:gap-4'>
                        {/* Left bidders */}
                        <div className="w-full flex flex-col relative gap-8 min-[1222px]:min-w-[380px] min-[1222px]:-top-8 min-[1222px]:[perspective:1000px] max-[1221px]:max-w-none max-[1221px]:gap-4">
                            <div className="w-full bg-gray-800/75 text-white rounded-xl p-4 border border-white/10 shadow-lg min-[1222px]:[transform:rotateY(20deg)] min-[1222px]:shadow-[-45px_45px_15px_0px_#00000050] max-[1221px]:p-3 max-[640px]:p-2">
                                <div className="text-sm font-semibold mb-3 max-[480px]:text-xs max-[480px]:mb-2">Current Bidders</div>
                                <div className="space-y-3">
                                    {leftBidders.map((b, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => handleBidderClick(b.name)}
                                            className={`flex relative h-full w-full items-center gap-4 bg-gray-800/75 p-2 rounded-2xl border transition-all cursor-pointer hover:bg-gray-800/90 max-[1221px]:gap-3 max-[1221px]:p-2 max-[1221px]:rounded-xl ${i === 0 ? 'ring-2 ring-yellow-400 border-yellow-400 shadow-2xl shadow-yellow-400/50' : ''}`}
                                            title="Click to view profile"
                                        >
                                            <div className="relative flex-shrink-0 shadow-lg rounded-full w-20 h-20 p-2 max-[1221px]:w-14 max-[1221px]:h-14 max-[1221px]:p-1.5 max-[640px]:w-12 max-[640px]:h-12 max-[640px]:p-1" style={{ backgroundImage: "url('/assets/auction/background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                                <img src={b.avatar} alt={b.name} className="w-18 h-18 rounded-full object-cover max-[1221px]:w-12 max-[1221px]:h-12 max-[640px]:w-10 max-[640px]:h-10" />
                                            </div>
                                            <div className='flex flex-col justify-center flex-1'>
                                                <div className="text-lg font-bold text-white max-[1221px]:text-base max-[640px]:text-sm">{b.name}</div>
                                                <div className='text-sm font-medium text-yellow-300/70 mt-1 max-[640px]:hidden'>Warsaw</div>
                                                <div className='text-md font-medium text-gray-300 flex gap-2 max-[640px]:hidden'>Portugal
                                                    <img src={flags[i]} alt='Flag' className='w-6 h-4 rounded mt-1 object-cover shadow-md' />
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end h-full mt-4 max-[1221px]:mt-0">
                                                <div className="text-2xl font-bold text-[#d5b775] max-[1221px]:text-lg max-[640px]:text-base">$317,548</div>
                                            </div>
                                            <img src='/assets/auction/percent.png' width={30} height={30} className="absolute top-2 right-2" />
                                        </div>
                                    ))}
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

                                {/* Slideshow: use gallery images or user's product images - Clickable to go to seller's profile */}
                                <div 
                                    className="w-full flex justify-center cursor-pointer"
                                    onClick={handleProductClick}
                                    title="Click to view seller's profile"
                                >
                                    <Slideshow galleryItem={galleryItem} userItem={userItem} isUser={isUser} />
                                </div>
                            </div>
                        </div>

                        {/* Right bidders */}
                        <div className="w-full flex flex-col relative gap-8 min-[1222px]:min-w-[380px] min-[1222px]:-top-8 min-[1222px]:[perspective:1000px] max-[1221px]:max-w-none max-[1221px]:gap-4">
                            <div className="w-full bg-gray-800/75 text-white rounded-xl p-4 border border-white/10 drop-shadow-2xl shadow-lg min-[1222px]:[transform:rotateY(-20deg)] min-[1222px]:shadow-[45px_45px_15px_0px_#00000050] max-[1221px]:p-3 max-[640px]:p-2">
                                <div className="text-sm font-semibold mb-3 max-[480px]:text-xs max-[480px]:mb-2">Competing Bids</div>
                                <div className="space-y-3">
                                    {rightBidders.map((b, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => handleBidderClick(b.name)}
                                            className={`flex relative h-full w-full items-center gap-4 bg-gray-800/75 p-2 rounded-2xl border transition-all cursor-pointer hover:bg-gray-800/90 max-[1221px]:gap-3 max-[1221px]:p-2 max-[1221px]:rounded-xl ${i === 0 ? 'ring-2 ring-yellow-400 border-yellow-400 shadow-2xl shadow-yellow-400/50' : ''}`}
                                            title="Click to view profile"
                                        >
                                            <div className="text-right flex flex-col items-end h-full mt-4 max-[1221px]:mt-0">
                                                <div className="text-2xl font-bold text-[#d5b775] max-[1221px]:text-lg max-[640px]:text-base">$317,548</div>
                                            </div>
                                            <div className='flex flex-col justify-center items-end flex-1'>
                                                <div className="text-lg font-bold text-white max-[1221px]:text-base max-[640px]:text-sm">{b.name}</div>
                                                <div className='text-sm font-medium text-yellow-300/70 mt-1 max-[640px]:hidden'>Warsaw</div>
                                                <div className='text-md font-medium text-gray-300 flex gap-2 max-[640px]:hidden'>
                                                    <img src={flags[flags.length - i - 1]} alt='Flag' className='w-6 h-4 rounded mt-1 object-cover shadow-md' />
                                                    Portugal
                                                </div>
                                            </div>
                                            <div className="relative flex-shrink-0 shadow-lg rounded-full w-20 h-20 p-2 max-[1221px]:w-14 max-[1221px]:h-14 max-[1221px]:p-1.5 max-[640px]:w-12 max-[640px]:h-12 max-[640px]:p-1" style={{ backgroundImage: "url('/assets/auction/background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                                <img src={b.avatar} alt={b.name} className="w-18 h-18 rounded-full object-cover max-[1221px]:w-12 max-[1221px]:h-12 max-[640px]:w-10 max-[640px]:h-10" />
                                            </div>
                                            <img src='/assets/auction/percent.png' width={30} height={30} className="absolute top-2 left-2" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setBidDialogOpen(true)} className="px-4 py-2 md:px-6 md:py-3 rounded-full text-white font-semibold max-[1221px]:py-2 max-[1221px]:text-sm" style={{ background: color }}>Place Bid</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Place Bid Dialog */}
            <PlaceBidDialog
                open={bidDialogOpen}
                onOpenChange={setBidDialogOpen}
                auctionId={id || ''}
                currentBid={317548}
                itemName={userItem?.fullName || galleryItem?.title || 'Auction Item'}
                itemImage={userItem?.photo || galleryItem?.imageUrl}
                minimumIncrement={5000}
            />
        </div>
    );
};

export default Auction;
