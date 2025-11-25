import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import galleryItems from '@/lib/galleryData';
import users from '@/lib/usersData';
import CircularTextBadge from '@/components/auction/CircularTextBadge';

function Slideshow({ galleryItem, userItem, isUser }: { galleryItem: any; userItem: any; isUser: boolean }) {
    const [index, setIndex] = useState(0);
    const [badgeRotation, setBadgeRotation] = useState(-50);
    const [charAngleStep, setCharAngleStep] = useState(6);
    const [startAngle, setStartAngle] = useState(0);
    const [text, setText] = useState("Established 2012");

    const slides = userItem
        ? [userItem.productImage1, userItem.productImage2].filter(Boolean)
        : (galleryItem ? (galleryItem.images ?? [galleryItem.imageUrl]) : []);

    if (!slides || slides.length === 0) {
        return null;
    }

    const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
    const next = () => setIndex((i) => (i + 1) % slides.length);

    // Get item name for caption
    const itemName = isUser ? (userItem as any).name : (galleryItem as any).title || 'Product';
    const itemDescription = isUser ? 'Premium Quality Product' : (galleryItem as any).description || 'High-end investment product';

    useEffect(() => {
        const img = new Image();
        img.src = slides[index];   // <-- your uploaded file

        img.onload = () => {
            const canvas = document.getElementById("screen");
            const ctx = canvas.getContext("2d");

            const W = 800;       // width of warped area
            const H = 500;       // height of warped area
            const X = 0;       // x offset inside canvas
            const Y = 0;        // y offset inside canvas

            const curveStrength = 0.5;  // 0 = no curve, 1 = very curved
            const borderCurve = 100;  // Border top/bottom curvature

            // White background
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const steps = 1200;               // number of vertical slices
            const sliceW = img.width / steps;

            for (let i = 0; i < steps; i++) {
                const t = i / (steps - 1);   // 0 → 1 across width

                // Curve shape: center goes backward, edges forward
                const curve =
                    Math.cos((t - 0.5) * Math.PI) * curveStrength;

                const targetHeight = H - curve * 200; // vertical stretch
                const targetY = Y + (H - targetHeight) / 2;

                ctx.drawImage(
                    img,
                    i * sliceW, 0, sliceW, img.height,   // source slice
                    X + t * W, targetY, sliceW * (W / img.width), targetHeight
                );
            }

            // ===== Draw curved border on top =====
            ctx.save();
            ctx.strokeStyle = "#000";   // border color
            ctx.lineWidth = 5;          // thickness

            ctx.beginPath();
            ctx.moveTo(X + 3, Y + 3);   // inset by ~3px

            ctx.quadraticCurveTo(
                X + W / 2,
                Y + borderCurve - 10,    // slightly reduced curve for inner effect
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
    }, [index]);

    return (
        <div className="w-full flex flex-col items-center gap-6">
            {/* 3D Frame Container */}
            <div className="w-full px-4">
                {/* Main image container with side borders */}
                <div className="relative bg-gradient-to-b rounded-3xl flex flex-col items-center">
                    {/* Image */}
                    <div className="relative rounded-2xl overflow-hidden z-1">
                        {/* <img
                            src={slides[index]}
                            alt={`slide-${index}`}
                            className="w-full  object-contain bg-gray-100"
                        /> */}
                        <canvas id="screen" className='flex-1' width="800" height="500"></canvas>

                        {/* Navigation Arrows - Positioned on sides of image */}
                        {slides.length > 1 && (
                            <>
                                <button
                                    onClick={prev}
                                    aria-label="previous"
                                    className="absolute -left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-full p-3 shadow-lg hover:shadow-xl transition-all text-2xl font-bold w-12 h-12 flex items-center justify-center z-10"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={next}
                                    aria-label="next"
                                    className="absolute -right-4 top-1/2 -translate-y-1/2 bg-gradient-to-l from-yellow-400 to-yellow-600 text-black rounded-full p-3 shadow-lg hover:shadow-xl transition-all text-2xl font-bold w-12 h-12 flex items-center justify-center"
                                >
                                    ›
                                </button>
                            </>
                        )}
                    </div>
                    <div className="w-14" style={{
                        margin: "auto",
                        position: "relative",
                        borderRadius: "50%",
                        top: -120
                    }}>
                        {slides.length > 1 && (
                            slides.map((s, i) => (
                                <div className='w-14 h-14' style={{
                                    font: "26px Monaco, MonoSpace",
                                    position: "absolute",
                                    left: -36 + i * 56,
                                    top: 0,
                                    transformOrigin: "center 240px",
                                    // transform: `rotate(${-0 + 35 * ( i - slides.length / 2 )}deg)`
                                }}>
                                    <button
                                        key={i}
                                        onClick={() => setIndex(i)}
                                        className={`w-14 h-14 rounded-lg overflow-hidden border shadow-lg transition-all ${i === index ? 'border-yellow-400 ring-2 ring-yellow-400 scale-105' : 'border-gray-400'
                                            }`}
                                    >
                                        <img src={s} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Caption Text */}
            <div className="text-center max-w-xl px-4">
                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                    {itemName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {itemDescription}
                </p>
            </div>

            {/* Advertisement Banner */}
            <div className="max-w-2xl mt-6">
                <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 rounded-lg border-2 border-teal-700 shadow-xl overflow-hidden relative">
                    <div className="relative z-10 flex items-center">
                        <div className="flex-1">
                            <img src='/assets/ad.png' />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

const color = '#0a3d5c';

const Auction: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const galleryItem = galleryItems.find(g => String(g.id) === id);
    const userItem = users.find(u => String(u.id) === id);
    const item = galleryItem ?? userItem;
    const isUser = !!userItem && !galleryItem;

    // Countdown state (start from 72 hours)
    const [secondsLeft, setSecondsLeft] = useState<number>(72 * 3600);

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
        <div className="relative min-h-screen pt-20 md:pt-28 pb-16">
            {/* Use an img tag instead of CSS background-image so it works on mobile */}
            <img src="/assets/auction-back.png" alt="Auction background" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            {/* subtle overlay to ensure foreground legibility */}
            <div className="absolute inset-0 bg-transparent pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto h-full">
                <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
                    {/* Left bidders */}
                    <div className="w-full md:min-w-1/5 flex flex-col gap-16" style={{
                        perspective: "1000px"
                    }}>
                        <div className="bg-gray-800/75 text-white rounded-xl p-4 shadow-lg border border-white/10" style={{ transform: "rotateY(20deg)" }}>
                            <div className="text-sm font-semibold mb-3">Current Bidders</div>
                            <div className="space-y-3">
                                {leftBidders.map((b, i) => (
                                    <div key={i} className={`flex items-center justify-between bg-white/5 p-3 rounded-md ${i === 0 ? 'ring-2 ring-yellow-400' : ''}`}>
                                        <div className="flex items-start gap-3">
                                            <img src={b.avatar} alt={b.name} className="w-10 h-10 rounded-full object-cover border" />
                                            <div className='flex flex-col items-start'>
                                                <div className="text-sm">
                                                    <div className="font-medium">{b.name}</div>
                                                </div>
                                                <div className="font-semibold">{b.amount}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Countdown below leading bid box */}
                        <div className="mt-4 rounded-md px-4 py-2 bg-gray-800/75 text-white flex flex-col items-start gap-4">
                            <div className="text-xs uppercase">Time Remaining</div>
                            <div className="font-semibold text-lg">{formatCountdown(secondsLeft)}</div>
                        </div>
                        {/* <button onClick={() => navigate('/')} className="px-4 py-2 rounded-full bg-white/10 text-white border text-sm md:text-base">Go To Back</button> */}
                    </div>

                    {/* Center image - moved lower and smaller */}
                    <div className="w-full md:min-w-3/5 flex flex-col items-center justify-between gap-8 md:gap-24 pt-8 md:pt-16">
                        {/* Leading bid box - use main color */}
                        <div className="mt-6 w-full flex flex-col items-center">
                            <div className="w-full flex justify-center">
                                <div className="rounded-xl px-5 py-3 shadow-lg flex items-center gap-4 w-full max-w-lg text-white border-4 border-[#D4AF37] bg-black/60">
                                    <img src={isUser ? (userItem as any).avatar : (galleryItem as any).author?.avatarUrl} alt={isUser ? (userItem as any).name : (galleryItem as any).author?.name} className="w-16 h-16 rounded-full object-cover border" />
                                    <div>
                                        <div className="text-xs uppercase">Leading Bid</div>
                                        <div className="font-semibold text-base">{isUser ? (userItem as any).name : (galleryItem as any).author?.name}</div>
                                    </div>
                                    <div className="ml-auto text-xl font-bold">$317,548</div>
                                </div>
                            </div>

                            {/* Slideshow: use gallery images or user's product images */}
                            <div className="w-full flex justify-center">
                                <Slideshow galleryItem={galleryItem} userItem={userItem} isUser={isUser} />
                            </div>
                        </div>
                    </div>

                    {/* Right bidders */}
                    <div className="w-full md:min-w-1/5 flex flex-col gap-16" style={{
                        perspective: "1000px"
                    }}>
                        <div className="bg-gray-800/75 text-white rounded-xl p-4 shadow-lg border border-white/10" style={{ transform: "rotateY(-20deg)" }}>
                            <div className="text-sm font-semibold mb-3">Competing Bids</div>
                            <div className="space-y-3">
                                {rightBidders.map((b, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-md">
                                        <div className="flex items-start gap-3">
                                            <img src={b.avatar} alt={b.name} className="w-10 h-10 rounded-full object-cover border" />
                                            <div className='flex flex-col items-start'>
                                                <div className="text-sm">
                                                    <div className="font-medium">{b.name}</div>
                                                </div>
                                                <div className="font-semibold">{b.amount}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => navigate('/')} className="px-4 py-2 md:px-6 md:py-3 rounded-full text-white font-semibold" style={{ background: color }}>Place Bid</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auction;
