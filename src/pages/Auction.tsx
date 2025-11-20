import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import galleryItems from '@/lib/galleryData';
import users from '@/lib/usersData';

function Slideshow({ galleryItem, userItem }: { galleryItem: any; userItem: any }) {
    const [index, setIndex] = useState(0);

    const slides = userItem
        ? [userItem.productImage1, userItem.productImage2].filter(Boolean)
        : (galleryItem ? (galleryItem.images ?? [galleryItem.imageUrl]) : []);

    if (!slides || slides.length === 0) {
        return null;
    }

    const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
    const next = () => setIndex((i) => (i + 1) % slides.length);

    return (
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white mt-8 md:mt-20">
            <div className="relative">
                <img src={slides[index]} alt={`slide-${index}`} className="w-full h-64 md:h-[300px] object-cover" />

                {slides.length > 1 && (
                    <>
                        <button onClick={prev} aria-label="previous" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2">
                            ‹
                        </button>
                        <button onClick={next} aria-label="next" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2">
                            ›
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                            {slides.map((s, i) => (
                                <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
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
            <img src="/assets/auction-back.webp" alt="Auction background" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            {/* subtle overlay to ensure foreground legibility */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 h-full">
                <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
                    {/* Left bidders */}
                    <div className="w-full md:w-1/4 flex flex-col gap-16">
                        <div className="bg-gray-800/75 text-white rounded-xl p-4 shadow-lg border border-white/10">
                            <div className="text-sm font-semibold mb-3">Current Bidders</div>
                            <div className="space-y-3">
                                {leftBidders.map((b, i) => (
                                    <div key={i} className={`flex items-center justify-between bg-white/5 p-3 rounded-md ${i === 0 ? 'ring-2 ring-yellow-400' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <img src={b.avatar} alt={b.name} className="w-10 h-10 rounded-full object-cover border" />
                                            <div className="text-sm">
                                                <div className="font-medium">{b.name}</div>
                                            </div>
                                        </div>
                                        <div className="font-semibold">{b.amount}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => navigate('/')} className="px-4 py-2 rounded-full bg-white/10 text-white border text-sm md:text-base">Go To Back</button>
                    </div>

                    {/* Center image - moved lower and smaller */}
                    <div className="w-full md:w-2/4 flex flex-col items-center justify-between gap-8 md:gap-24 pt-8 md:pt-16">
                        {/* Leading bid box - use main color */}
                        <div className="mt-6 w-full flex flex-col items-center">
                            <div className="w-full flex justify-center">
                                <div className="rounded-xl px-5 py-3 shadow-lg flex items-center gap-4 w-full max-w-lg" style={{ background: '#D4AF37', color: 'white' }}>
                                    <img src={isUser ? (userItem as any).avatar : (galleryItem as any).author?.avatarUrl} alt={isUser ? (userItem as any).name : (galleryItem as any).author?.name} className="w-16 h-16 rounded-full object-cover border" />
                                    <div>
                                        <div className="text-xs uppercase">Leading Bid</div>
                                        <div className="font-semibold text-base">{isUser ? (userItem as any).name : (galleryItem as any).author?.name}</div>
                                    </div>
                                    <div className="ml-auto text-xl font-bold">$317,548</div>
                                </div>
                            </div>

                            {/* Countdown below leading bid box */}
                            <div className="mt-4 w-full flex justify-center">
                                <div className="rounded-md px-4 py-2 bg-gray-800/75 text-white inline-flex items-center gap-4">
                                    <div className="text-xs uppercase">Time Remaining</div>
                                    <div className="font-semibold text-lg">{formatCountdown(secondsLeft)}</div>
                                </div>
                            </div>

                            {/* Slideshow: use gallery images or user's product images */}
                            <div className="w-full flex justify-center">
                                <Slideshow galleryItem={galleryItem} userItem={userItem} />
                            </div>
                        </div>
                    </div>

                    {/* Right bidders */}
                    <div className="w-full md:w-1/4 flex flex-col gap-16">
                        <div className="bg-gray-800/75 text-white rounded-xl p-4 shadow-lg border border-white/10">
                            <div className="text-sm font-semibold mb-3">Competing Bids</div>
                            <div className="space-y-3">
                                {rightBidders.map((b, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <img src={b.avatar} alt={b.name} className="w-10 h-10 rounded-full object-cover border" />
                                            <div className="text-sm">
                                                <div className="font-medium">{b.name}</div>
                                            </div>
                                        </div>
                                        <div className="font-semibold">{b.amount}</div>
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
