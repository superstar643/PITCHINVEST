import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import galleryItems from '@/lib/galleryData';

const color = '#0a3d5c';

const Auction: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const item = galleryItems.find(g => String(g.id) === id);

    if (!item) {
        return (
            <AppLayout>
                <div className="min-h-screen flex items-center justify-center">Auction item not found</div>
            </AppLayout>
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
        <AppLayout>
            <div className="relative min-h-screen pt-20 md:pt-28 pb-16">
                {/* Use an img tag instead of CSS background-image so it works on mobile */}
                <img src="/assets/auction-back.webp" alt="Auction background" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                {/* subtle overlay to ensure foreground legibility */}
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 h-full">
                    <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
                        {/* Left bidders */}
                        <div className="w-full md:w-1/4">
                            <div className="bg-gray-800/75 text-white rounded-xl p-4 shadow-lg border border-white/10">
                                <div className="text-sm font-semibold mb-3">Current Bidders</div>
                                <div className="space-y-3">
                                    {leftBidders.map((b, i) => (
                                        <div key={i} className={`flex items-center justify-between bg-white/5 p-3 rounded-md ${i===0? 'ring-2 ring-yellow-400': ''}`}>
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
                        </div>

                        {/* Center image - moved lower and smaller */}
                        <div className="w-full md:w-2/4 flex flex-col items-center justify-between gap-8 md:gap-24 pt-8 md:pt-16">
                            {/* Leading bid box - use main color */}
                            <div className="mt-6">
                                <div className="rounded-xl px-5 py-3 shadow-lg flex items-center gap-4" style={{ background: '#D4AF37', color: 'white' }}>
                                    <img src={item.author?.avatarUrl} alt={item.author?.name} className="w-24 h-24 rounded-full object-cover border" />
                                    <div>
                                        <div className="text-xs uppercase">Leading Bid</div>
                                        <div className="font-semibold text-base">{item.author?.name}</div>
                                    </div>
                                    <div className="ml-auto text-xl font-bold">$317,548</div>
                                </div>
                            </div>
                            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white mt-8 md:mt-20">
                                <img src={(item.images ?? [item.imageUrl])[0]} alt={item.title} className="w-full h-64 md:h-[300px] object-cover" />
                            </div>
                        </div>

                        {/* Right bidders */}
                        <div className="w-full md:w-1/4">
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
                        </div>
                    </div>

                    {/* Bottom right controls */}
                    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 md:static md:right-8 md:bottom-8 md:transform-none">
                        <button onClick={() => window.location.href = '/gallery'} className="px-4 py-2 rounded-full bg-white/10 text-white border text-sm md:text-base">Go To Back</button>
                        <button onClick={() => window.location.href = '/'} className="px-4 py-2 md:px-6 md:py-3 rounded-full text-white font-semibold" style={{ background: color }}>Place Bid</button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Auction;
