import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import galleryItems from '@/lib/galleryData';
import users from '@/lib/usersData';
import { GalleryCard } from '@/components/GalleryCard';
import { MoveLeft, ChevronLeft, ChevronRight } from 'lucide-react';
const color = '#0a3d5c';

const GalleryDetail: React.FC = () => {
    const { id } = useParams();
    const item = galleryItems.find(g => String(g.id) === id);
    const [currentIdx, setCurrentIdx] = useState(0);
    const navigate = useNavigate();

    // Find matching user by author name (fallback method when user_id not available)
    const findUserByAuthorName = (authorName: string | undefined) => {
        if (!authorName) return null;
        return users.find(u => 
            u.fullName.toLowerCase().includes(authorName.toLowerCase()) || 
            authorName.toLowerCase().includes(u.fullName.toLowerCase())
        );
    };

    const handleAuthorClick = () => {
        if (item?.author) {
            const matchedUser = findUserByAuthorName(item.author.name);
            if (matchedUser && matchedUser.id) {
                navigate(`/user/${matchedUser.id}`);
            }
        }
    };

    if (!item) {
        return (
            <div className="min-h-screen flex items-center justify-center">Item not found</div>
        );
    }

    return (
        <>
            <div className="bg-white pt-24 px-6 flex flex-col gap-6 mb-12 pb-12">
                <div className="mt-6 border-b border-[#0a3d5c] px-4 py-2 w-full">
                    <Link to="/gallery" className="text-sm flex gap-2" style={{ color }}> <MoveLeft size={16} /> Back to gallery</Link>
                </div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left - Large Image (slideshow) */}
                    <div>
                        <div className="rounded-2xl overflow-hidden shadow-lg relative">
                            {/* main slide */}
                            {((item as any).images ?? [item.imageUrl]).length > 0 && (
                                <img
                                    src={((item as any).images ?? [item.imageUrl])[currentIdx]}
                                    alt={item.title}
                                    className="w-full h-[520px] object-cover"
                                />
                            )}

                            {/* left / right arrows */}
                            <button
                                onClick={() => setCurrentIdx((prev) => (prev - 1 + ((item as any).images ?? [item.imageUrl]).length) % ((item as any).images ?? [item.imageUrl]).length)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white z-20"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setCurrentIdx((prev) => (prev + 1) % ((item as any).images ?? [item.imageUrl]).length)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white z-20"
                                aria-label="Next image"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="flex gap-3 mt-4">
                            {/* thumbnails */}
                            {((item as any).images ?? [item.imageUrl]).map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIdx(idx)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border ${currentIdx === idx ? 'ring-2 ring-[#0a3d5c]' : ''}`}
                                >
                                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right - Detail panel */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {item.badges && item.badges.map((b: string, i: number) => (
                                <span key={i} className="text-xs font-semibold bg-white px-3 py-1 rounded-full shadow-sm border" style={{ color }}>{b}</span>
                            ))}
                            <div className="ml-auto">
                                <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                                    <span className="text-sm">{item.likes ?? 0}</span>
                                </div>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold" style={{ color }}>{item.title}</h1>
                        {item.subtitle && <p className="text-gray-600 mt-2">{item.subtitle}</p>}
                        <p className="text-sm text-gray-500 mt-2">{item.description}</p>

                        <div 
                            onClick={handleAuthorClick}
                            className="mt-6 bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:bg-gray-50 transition"
                        >
                            <h4 className="text-xs font-semibold text-gray-500">INVENTOR</h4>
                            <div className="flex items-center gap-4 mt-3">
                                <img src={item.author?.avatarUrl} alt={item.author?.name} className="w-14 h-14 rounded-full object-cover border" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold" style={{ color }}>{item.author?.name}</span>
                                        {item.author?.verified && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                                    </div>
                                    <div className="text-xs text-gray-500">{item.location}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm border">
                                <h4 className="text-xs font-semibold text-gray-500">LOCATION</h4>
                                <div className="mt-2 font-semibold">{item.location}</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border">
                                <h4 className="text-xs font-semibold text-gray-500">CATEGORY</h4>
                                <div className="mt-2 flex gap-2 flex-wrap">
                                    <span className="text-xs bg-gray-50 px-2 py-1 rounded-full border">{item.category}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-gray-500">CURRENT BID</div>
                                    <div className="text-xl font-bold">$22,000,000</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">TOTAL BIDS</div>
                                    <div className="text-xl font-bold">45</div>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button 
                                    onClick={() => navigate(`/auction/${item.id}`)} 
                                    className="flex-1 px-4 py-2 rounded-full bg-[#0a3d5c] text-white font-medium hover:bg-[#062a3d] transition-all"
                                >
                                    View Auction
                                </button>
                                <button 
                                    onClick={() => navigate(`/auction/${item.id}`)} 
                                    className="px-4 py-2 rounded-full bg-[#0a3d5c] text-white font-medium hover:bg-[#062a3d] transition-all"
                                >
                                    Place a bid
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Additional information section */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Descriptions and documents (span 2 cols on lg) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 className="font-semibold text-lg" style={{ color }}>Project Description</h3>
                        <p className="text-sm text-gray-600 mt-3">{item.description}. Detailed project overview and value proposition are provided here to give potential investors context and rationale for interest.</p>
                    </div>

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
                                <div className="font-bold">$25.0M</div>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">Minimum Investment: USD 10,000,000</div>
                    </div>

                    <div>
                        <button className="w-full px-4 py-3 rounded-full text-white font-medium" style={{ background: color }}>REGISTER TO INVEST</button>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border">
                        <h4 className="text-xs text-gray-500">Key Facts</h4>
                        <div className="mt-4 text-sm">
                            <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Project ID</span><span className="font-semibold">PROJ-{item.id}</span></div>
                            <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Status</span><span className="font-semibold">In Auction</span></div>
                            <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Category</span><span className="font-semibold">{item.category}</span></div>
                            <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Listed</span><span className="font-semibold">Sep 2024</span></div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-500">Auction</span>
                                <button 
                                    onClick={() => navigate(`/auction/${item.id}`)}
                                    className="font-semibold text-[#0a3d5c] hover:underline flex items-center gap-1"
                                >
                                    View Live Auction →
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border">
                        <h4 className="text-xs text-gray-500">Share Project</h4>
                        <div className="mt-3 flex gap-3">
                            <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center">🔗</button>
                            <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center">🐦</button>
                            <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center">📘</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Gallery */}
            <div className="max-w-7xl mx-auto mt-8 mb-20">
                <h2 className="text-2xl font-semibold" style={{ color }}>Similar Gallery</h2>
                <p className="text-sm text-gray-500 mt-2 mb-3">Explore related items you might be interested in.</p>
                <div className="flex gap-4 w-full overflow-x-auto custom-scrollbar min-h-[500px]">
                    {galleryItems.filter(g => g.id !== item.id).slice(0, 8).map(g => (
                        <div className='min-w-[300px]'>
                            <GalleryCard key={g.id} {...g} onClick={() => navigate(`/gallery/${g.id}`)} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default GalleryDetail;
